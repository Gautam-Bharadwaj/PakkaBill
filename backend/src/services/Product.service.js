const productRepo = require('../repositories/Product.repository');
const ApiError = require('../utils/ApiError');

class ProductService {
  async list(query = '', status = 'all', page = 1, limit = 20, ownerId) {
    return productRepo.search(query, status, { page, limit }, ownerId);
  }

  async getById(id) {
    const product = await productRepo.findById(id);
    if (!product) throw ApiError.notFound('Product not found');
    return product;
  }

  async create(data, ownerId) {
    const existing = await productRepo.findOne({ name: data.name, owner: ownerId });
    if (existing) throw ApiError.conflict('Product with this name already exists');
    return productRepo.create({ ...data, owner: ownerId });
  }

  async update(id, data) {
    await this.getById(id);
    return productRepo.update(id, data);
  }

  async delete(id) {
    await this.getById(id);
    // PATTERN: Soft delete — archive instead of remove
    return productRepo.update(id, { status: 'archived' });
  }

  async getLowStock() {
    return productRepo.findLowStock();
  }

  async getTopProducts(limit = 5, ownerId) {
    return productRepo.getTopProducts(limit, ownerId);
  }
}

module.exports = new ProductService();
