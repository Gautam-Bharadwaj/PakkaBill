const MLInsight = require('../models/MLInsight.model');
const mlService = require('../services/ML.service');
const { asyncHandler } = require('../utils/asyncHandler');

exports.proxyDemand = asyncHandler(async (req, res) => {
  const { ok, status, data } = await mlService.predictDemand(req.body || {});
  if (!ok) return res.status(status).json(data);
  await MLInsight.findOneAndUpdate(
    { kind: 'demand' },
    { kind: 'demand', payload: data, computedAt: new Date() },
    { upsert: true }
  );
  return res.json(data);
});

exports.proxyDealer = asyncHandler(async (req, res) => {
  const { ok, status, data } = await mlService.analyzeDealers(req.body || {});
  if (!ok) return res.status(status).json(data);
  await MLInsight.findOneAndUpdate(
    { kind: 'dealer_segments' },
    { kind: 'dealer_segments', payload: data, computedAt: new Date() },
    { upsert: true }
  );
  return res.json(data);
});

exports.proxyPricing = asyncHandler(async (req, res) => {
  const { ok, status, data } = await mlService.optimizePricing(req.body || {});
  if (!ok) return res.status(status).json(data);
  return res.json(data);
});

exports.proxyLowMargin = asyncHandler(async (req, res) => {
  const { ok, status, data } = await mlService.lowMargin();
  if (!ok) return res.status(status).json(data);
  return res.json(data);
});
