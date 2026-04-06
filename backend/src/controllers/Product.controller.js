const productService = require('../services/Product.service');
const ApiResponse = require('../utils/ApiResponse');

class ProductController {
  async list(req, res, next) {
    try {
      const { q = '', status = 'all', page = 1, limit = 20 } = req.query;
      const result = await productService.list(q, status, Number(page), Number(limit));
      ApiResponse.success(res, result.data, 'Products fetched', 200, result.pagination);
    } catch (err) { next(err); }
  }

  async getById(req, res, next) {
    try {
      const product = await productService.getById(req.params.id);
      ApiResponse.success(res, product, 'Product fetched');
    } catch (err) { next(err); }
  }

  async create(req, res, next) {
    try {
      const product = await productService.create(req.body);
      ApiResponse.created(res, product, 'Product created');
    } catch (err) { next(err); }
  }

  async update(req, res, next) {
    try {
      const product = await productService.update(req.params.id, req.body);
      ApiResponse.success(res, product, 'Product updated');
    } catch (err) { next(err); }
  }

  async delete(req, res, next) {
    try {
      await productService.delete(req.params.id);
      ApiResponse.success(res, null, 'Product archived');
    } catch (err) { next(err); }
  }
}

module.exports = new ProductController();
