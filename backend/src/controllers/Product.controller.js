const productService = require('../services/Product.service');
const { asyncHandler } = require('../utils/asyncHandler');

exports.list = asyncHandler(async (req, res) => {
  const products = await productService.list(req.query);
  res.json({ products });
});

exports.getOne = asyncHandler(async (req, res) => {
  const product = await productService.getById(req.params.id);
  res.json({ product });
});

exports.create = asyncHandler(async (req, res) => {
  const product = await productService.create(req.body);
  res.status(201).json({ product });
});

exports.update = asyncHandler(async (req, res) => {
  const product = await productService.update(req.params.id, req.body);
  res.json({ product });
});

exports.remove = asyncHandler(async (req, res) => {
  const product = await productService.archive(req.params.id);
  res.json({ product });
});
