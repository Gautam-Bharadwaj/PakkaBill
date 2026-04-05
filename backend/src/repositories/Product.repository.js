const { BaseRepository } = require('./Base.repository');
const ProductModel = require('../models/Product.model');

class ProductRepository extends BaseRepository {
  constructor() {
    super(ProductModel);
  }

  static notArchivedFilter() {
    return { isArchived: false };
  }

  findAvailable(extra = {}) {
    const q = { ...ProductRepository.notArchivedFilter(), ...extra };
    return this.model.find(q);
  }

  findByIdAvailable(id) {
    return this.model.findOne({ ...ProductRepository.notArchivedFilter(), _id: id });
  }
}

module.exports = { ProductRepository };
