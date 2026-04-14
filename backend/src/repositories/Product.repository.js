const BaseRepository = require('./Base.repository');
const Product = require('../models/Product.model');

class ProductRepository extends BaseRepository {
  constructor() {
    super(Product);
  }

  async search(query, status, options = {}, ownerId) {
    const filter = { owner: ownerId };
    if (query) {
      filter.$or = [
        { name: { $regex: query, $options: 'i' } },
        { sku: { $regex: query, $options: 'i' } }
      ];
    }
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

  async getTopProducts(limit = 5, ownerId) {
    return this.model
      .find({ owner: ownerId, status: 'active' })
      .sort({ unitsSold: -1 })
      .limit(limit)
      .lean();
  }
}

module.exports = new ProductRepository();
