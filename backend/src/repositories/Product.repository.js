const BaseRepository = require('./Base.repository');
const Product = require('../models/Product.model');

class ProductRepository extends BaseRepository {
  constructor() {
    super(Product);
  }

  async search(query, status, options = {}) {
    const filter = {};
    if (query) filter.$text = { $search: query };
    if (status && status !== 'all') filter.status = status;
    else if (!query) filter.status = { $ne: 'archived' };
    return this.findAll(filter, options);
  }

  async findLowStock() {
    return this.model
      .find({ $expr: { $lte: ['$stockQuantity', '$lowStockThreshold'] }, status: 'active' })
      .lean();
  }

  async updateStock(id, quantityDelta, options = {}) {
    return this.model.findByIdAndUpdate(
      id,
      { $inc: { stockQuantity: quantityDelta } },
      { new: true, session: options.session }
    );
  }

  async updateSalesStats(id, quantity, revenue, profit, options = {}) {
    return this.model.findByIdAndUpdate(
      id,
      { $inc: { unitsSold: quantity, revenue, profit } },
      { new: true, session: options.session }
    );
  }

  async getTopProducts(limit = 5) {
    return this.model
      .find({ status: 'active' })
      .sort({ unitsSold: -1 })
      .limit(limit)
      .lean();
  }
}

module.exports = new ProductRepository();
