const BaseRepository = require('./Base.repository');
const Invoice = require('../models/Invoice.model');

class InvoiceRepository extends BaseRepository {
  constructor() {
    super(Invoice);
  }

  async findByDealer(dealerId, options = {}) {
    return this.findAll({ dealer: dealerId }, options);
  }

  async search(query, status, options = {}, ownerId) {
    const filter = { owner: ownerId };
    if (status && status !== 'all') filter.paymentStatus = status;

    if (query) {
      filter.$or = [
        { invoiceId: { $regex: query, $options: 'i' } },
        { dealerName: { $regex: query, $options: 'i' } },
        { dealerShop: { $regex: query, $options: 'i' } }
      ];
    }

    return this.findAll(filter, { ...options, populate: 'dealer' });
  }

  async findWithDateRange(startDate, endDate, filter = {}) {
    return this.model
      .find({
        ...filter,
        createdAt: { $gte: startDate, $lte: endDate },
      })
      .sort({ createdAt: -1 })
      .lean();
  }

  async getRevenueByDay(days = 30, ownerId) {
    const start = new Date();
    start.setDate(start.getDate() - days);

    return this.aggregate([
      { $match: { owner: ownerId, createdAt: { $gte: start } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          revenue: { $sum: '$totalAmount' },
          profit: { $sum: '$totalProfit' },
          invoiceCount: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);
  }

  async getMonthlySummary(ownerId) {
    const now = new Date();
    
    const startOfCurrentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfPrevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfPrevMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);

    const [currentMonth, prevMonth] = await Promise.all([
      this.aggregate([
        { $match: { owner: ownerId, createdAt: { $gte: startOfCurrentMonth } } },
        {
          $group: {
            _id: null,
            totalRevenue: { $sum: '$totalAmount' },
            totalProfit: { $sum: '$totalProfit' },
            invoiceCount: { $sum: 1 },
          },
        },
      ]),
      this.aggregate([
        { $match: { owner: ownerId, createdAt: { $gte: startOfPrevMonth, $lte: endOfPrevMonth } } },
        {
          $group: {
            _id: null,
            totalRevenue: { $sum: '$totalAmount' },
          },
        },
      ]),
    ]);

    const current = currentMonth[0] || { totalRevenue: 0, totalProfit: 0, invoiceCount: 0 };
    const prevRevenue = prevMonth[0]?.totalRevenue || 0;

    let revenueGrowth = 0;
    if (prevRevenue > 0) {
      revenueGrowth = ((current.totalRevenue - prevRevenue) / prevRevenue) * 100;
    } else if (current.totalRevenue > 0) {
      revenueGrowth = 100; // 100% growth if prev was 0
    }

    return {
      ...current,
      revenueGrowth: parseFloat(revenueGrowth.toFixed(1)),
    };
  }
}

module.exports = new InvoiceRepository();
