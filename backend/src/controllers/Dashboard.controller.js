const dealerService = require('../services/Dealer.service');
const productService = require('../services/Product.service');
const invoiceService = require('../services/Invoice.service');
const mlService = require('../services/ML.service');
const Dealer = require('../models/Dealer.model');
const ApiResponse = require('../utils/ApiResponse');

class DashboardController {
  async getSummary(req, res, next) {
    try {
      const [monthly, pendingAmount, activeDealers] = await Promise.all([
        invoiceService.getMonthlySummary(),
        Dealer.aggregate([{ $group: { _id: null, total: { $sum: '$pendingAmount' } } }]),
        Dealer.countDocuments({ status: 'active' }),
      ]);

      ApiResponse.success(res, {
        totalRevenueMTD: monthly.totalRevenue,
        totalProfitMTD: monthly.totalProfit,
        invoiceCountMTD: monthly.invoiceCount,
        totalPendingAmount: pendingAmount[0]?.total || 0,
        activeDealers,
      }, 'Dashboard summary fetched');
    } catch (err) { next(err); }
  }

  async getRevenueChart(req, res, next) {
    try {
      const { days = 30 } = req.query;
      const data = await invoiceService.getRevenueChart(Number(days));
      ApiResponse.success(res, data, 'Revenue chart data fetched');
    } catch (err) { next(err); }
  }

  async getTopProducts(req, res, next) {
    try {
      const { limit = 5 } = req.query;
      const products = await productService.getTopProducts(Number(limit));
      ApiResponse.success(res, products, 'Top products fetched');
    } catch (err) { next(err); }
  }

  async getPendingDealers(req, res, next) {
    try {
      const { limit = 10 } = req.query;
      const dealers = await dealerService.getPendingDealers(Number(limit));
      ApiResponse.success(res, dealers, 'Pending dealers fetched');
    } catch (err) { next(err); }
  }

  async getMlInsights(req, res, next) {
    try {
      const [demand, segments, pricing, margins] = await Promise.all([
        mlService.getDemandPredictions(),
        mlService.getDealerSegments(),
        mlService.getPricingSuggestions(),
        mlService.getMarginAlerts(),
      ]);
      ApiResponse.success(res, { demand, segments, pricing, margins }, 'ML insights fetched');
    } catch (err) { next(err); }
  }
}

module.exports = new DashboardController();
