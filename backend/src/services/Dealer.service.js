const dealerRepo = require('../repositories/Dealer.repository');
const ApiError = require('../utils/ApiError');

class DealerService {
  async list(query = '', status, page = 1, limit = 20, ownerId) {
    return dealerRepo.search(query, { page, limit, status }, ownerId);
  }

  async getById(id) {
    const dealer = await dealerRepo.findById(id);
    if (!dealer) throw ApiError.notFound('Dealer not found');
    return dealer;
  }

  async create(data, ownerId) {
    const existing = await dealerRepo.findOne({ phone: data.phone, owner: ownerId });
    if (existing) throw ApiError.conflict('A dealer with this phone already exists');
    return dealerRepo.create({ ...data, owner: ownerId });
  }

  async update(id, data) {
    await this.getById(id);
    if (data.phone) delete data.phone; // phone is immutable
    return dealerRepo.update(id, data);
  }

  async delete(id) {
    await this.getById(id);
    return dealerRepo.delete(id);
  }

  async getPendingDealers(limit = 10, ownerId) {
    return dealerRepo.findPendingDealers(limit, ownerId);
  }
}

module.exports = new DealerService();
