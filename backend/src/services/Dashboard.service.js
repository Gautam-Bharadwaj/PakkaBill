const InvoiceModel = require('../models/Invoice.model');
const DealerModel = require('../models/Dealer.model');
const ProductModel = require('../models/Product.model');
const MLInsightModel = require('../models/MLInsight.model');
const { DealerRepository } = require('../repositories/Dealer.repository');
const { startOfMonth, startOfYear } = require('../utils/date');

class DashboardService {
  async getSummary() {
    const now = new Date();
    const mtdStart = startOfMonth(now);
    const ytdStart = startOfYear(now);

    const [monthToDateAgg, yearToDateAgg, pendingAgg, lowStock, recentInvoices, topByQty, topByProfit, mlInsight] = await Promise.all([
      InvoiceModel.aggregate([
        { $match: { createdAt: { $gte: mtdStart } } },
        { $group: { _id: null, revenue: { $sum: '$totalAmount' }, profit: { $sum: '$totalProfit' } } },
      ]),
      InvoiceModel.aggregate([
        { $match: { createdAt: { $gte: ytdStart } } },
        { $group: { _id: null, revenue: { $sum: '$totalAmount' }, profit: { $sum: '$totalProfit' } } },
      ]),
      DealerModel.aggregate([
        {
          $match: {
            $and: [DealerRepository.activeFilter(), { pendingAmount: { $gt: 0 } }],
          },
        },
        { $group: { _id: null, total: { $sum: '$pendingAmount' } } },
      ]),
      ProductModel.find({
        isArchived: false,
        $expr: { $lte: ['$stockQuantity', '$lowStockThreshold'] },
      })
        .sort({ stockQuantity: 1 })
        .limit(20)
        .lean(),
      InvoiceModel.find().sort({ createdAt: -1 }).limit(10).lean(),
      InvoiceModel.aggregate([
        { $unwind: '$items' },
        {
          $group: {
            _id: '$items.productId',
            name: { $first: '$items.productSnapshot.name' },
            qty: { $sum: '$items.quantity' },
          },
        },
        { $sort: { qty: -1 } },
        { $limit: 5 },
      ]),
      InvoiceModel.aggregate([
        { $unwind: '$items' },
        {
          $group: {
            _id: '$items.productId',
            name: { $first: '$items.productSnapshot.name' },
            profit: { $sum: '$items.lineProfit' },
          },
        },
        { $sort: { profit: -1 } },
        { $limit: 5 },
      ]),
      MLInsightModel.findOne().sort({ computedAt: -1 }).lean(),
    ]);

    const mtd = monthToDateAgg[0] || { revenue: 0, profit: 0 };
    const ytd = yearToDateAgg[0] || { revenue: 0, profit: 0 };
    const pendingTotal = pendingAgg[0]?.total || 0;

    return {
      mtd: {
        revenue: mtd.revenue,
        profit: mtd.profit,
        marginPct: mtd.revenue > 0 ? (mtd.profit / mtd.revenue) * 100 : 0,
      },
      ytd: {
        revenue: ytd.revenue,
        profit: ytd.profit,
        marginPct: ytd.revenue > 0 ? (ytd.profit / ytd.revenue) * 100 : 0,
      },
      pendingPayments: { total: pendingTotal },
      topSelling: topByQty,
      topProfitable: topByProfit,
      recentInvoices,
      lowStock,
      mlInsight,
    };
  }

  async getTopProducts() {
    const [topByQty, topByProfit] = await Promise.all([
      InvoiceModel.aggregate([
        { $unwind: '$items' },
        {
          $group: {
            _id: '$items.productId',
            name: { $first: '$items.productSnapshot.name' },
            qty: { $sum: '$items.quantity' },
          },
        },
        { $sort: { qty: -1 } },
        { $limit: 5 },
      ]),
      InvoiceModel.aggregate([
        { $unwind: '$items' },
        {
          $group: {
            _id: '$items.productId',
            name: { $first: '$items.productSnapshot.name' },
            profit: { $sum: '$items.lineProfit' },
          },
        },
        { $sort: { profit: -1 } },
        { $limit: 5 },
      ]),
    ]);
    return { byQuantity: topByQty, byProfit: topByProfit };
  }

  async getPendingDealers() {
    return DealerModel.find({
      ...DealerRepository.activeFilter(),
      pendingAmount: { $gt: 0 },
    })
      .sort({ pendingAmount: -1 })
      .limit(50)
      .lean();
  }

  async getMlInsights() {
    return MLInsightModel.findOne().sort({ computedAt: -1 }).lean();
  }
}

module.exports = new DashboardService();
