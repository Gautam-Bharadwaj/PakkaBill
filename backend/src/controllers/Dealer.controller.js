const dealerService = require('../services/Dealer.service');
const { asyncHandler } = require('../utils/asyncHandler');

exports.list = asyncHandler(async (req, res) => {
  const dealers = await dealerService.list(req.query);
  res.json({ dealers });
});

exports.getOne = asyncHandler(async (req, res) => {
  const dealer = await dealerService.getById(req.params.id);
  res.json({ dealer });
});

exports.create = asyncHandler(async (req, res) => {
  const dealer = await dealerService.create(req.body);
  res.status(201).json({ dealer });
});

exports.update = asyncHandler(async (req, res) => {
  const dealer = await dealerService.update(req.params.id, req.body);
  res.json({ dealer });
});

exports.remove = asyncHandler(async (req, res) => {
  const result = await dealerService.softDelete(req.params.id);
  res.json(result);
});

exports.invoices = asyncHandler(async (req, res) => {
  const invoices = await dealerService.purchaseHistory(req.params.id);
  res.json({ invoices });
});

exports.payments = asyncHandler(async (req, res) => {
  const payments = await dealerService.paymentsForDealer(req.params.id);
  res.json({ payments });
});
