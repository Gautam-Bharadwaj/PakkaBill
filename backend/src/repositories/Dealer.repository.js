const { BaseRepository } = require('./Base.repository');
const DealerModel = require('../models/Dealer.model');

class DealerRepository extends BaseRepository {
  constructor() {
    super(DealerModel);
  }

  /** Active dealers: isActive is true */
  static activeFilter() {
    return { isActive: true };
  }

  findActive(extra = {}) {
    const q = { ...DealerRepository.activeFilter(), ...extra };
    return this.model.find(q);
  }

  findOneActive(filter) {
    return this.model.findOne({ ...DealerRepository.activeFilter(), ...filter });
  }

  findByPhone(phone) {
    return this.model.findOne({ ...DealerRepository.activeFilter(), phone });
  }

  findExceedingCredit() {
    return this.model.find({
      ...DealerRepository.activeFilter(),
      $expr: { $gt: ['$pendingAmount', '$creditLimit'] },
    });
  }
}

module.exports = { DealerRepository };
