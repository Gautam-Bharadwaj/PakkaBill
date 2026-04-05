const dashboardService = require('../services/Dashboard.service');
const { asyncHandler } = require('../utils/asyncHandler');

exports.summary = asyncHandler(async (req, res) => {
  const data = await dashboardService.getSummary();
  res.json(data);
});

exports.topProducts = asyncHandler(async (req, res) => {
  const data = await dashboardService.getTopProducts();
  res.json(data);
});

exports.pendingDealers = asyncHandler(async (req, res) => {
  const dealers = await dashboardService.getPendingDealers();
  res.json({ dealers });
});

exports.mlInsights = asyncHandler(async (req, res) => {
  const mlInsight = await dashboardService.getMlInsights();
  res.json({ mlInsight });
});
