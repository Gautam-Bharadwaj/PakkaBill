const BaseRepository = require('./Base.repository');
const Invoice = require('../models/Invoice.model');

class InvoiceRepository extends BaseRepository {
  constructor() {
    super(Invoice);
  }

  async findByDealer(dealerId, options = {}) {
    return this.findAll({ dealer: dealerId }, options);
  }

  async findByStatus(status, options = {}) {
    const filter = status && status !== 'all' ? { paymentStatus: status } : {};
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

  async getRevenueByDay(days = 30) {
    const start = new Date();
    start.setDate(start.getDate() - days);

    return this.aggregate([
      { $match: { createdAt: { $gte: start } } },
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

  async getMonthlySummary() {
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const [result] = await this.aggregate([
      { $match: { createdAt: { $gte: startOfMonth } } },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$totalAmount' },
          totalProfit: { $sum: '$totalProfit' },
          invoiceCount: { $sum: 1 },
        },
      },
    ]);

    return result || { totalRevenue: 0, totalProfit: 0, invoiceCount: 0 };
  }
}

module.exports = new InvoiceRepository();
