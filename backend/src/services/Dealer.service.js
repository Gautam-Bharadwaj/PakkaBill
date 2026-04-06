const dealerRepo = require('../repositories/Dealer.repository');
const ApiError = require('../utils/ApiError');

class DealerService {
  async list(query = '', status, page = 1, limit = 20) {
    return dealerRepo.search(query, { page, limit, status });
  }

  async getById(id) {
    const dealer = await dealerRepo.findById(id);
    if (!dealer) throw ApiError.notFound('Dealer not found');
    return dealer;
  }

  async create(data) {
    const existing = await dealerRepo.findOne({ phone: data.phone });
    if (existing) throw ApiError.conflict('A dealer with this phone already exists');
    return dealerRepo.create(data);
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

  async getPendingDealers(limit = 10) {
    return dealerRepo.findPendingDealers(limit);
  }
}

module.exports = new DealerService();
