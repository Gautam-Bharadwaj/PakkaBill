const BaseRepository = require('./Base.repository');
const Dealer = require('../models/Dealer.model');

// PATTERN: Repository extending BaseRepository
class DealerRepository extends BaseRepository {
  constructor() {
    super(Dealer);
  }

  async search(query, options = {}) {
    const filter = query
      ? { $text: { $search: query } }
      : {};
    return this.findAll(filter, options);
  }

  async findByStatus(status, options = {}) {
    const filter = status && status !== 'all' ? { status } : {};
    return this.findAll(filter, options);
  }

  async findPendingDealers(limit = 10) {
    return this.model
      .find({ pendingAmount: { $gt: 0 } })
      .sort({ pendingAmount: -1 })
      .limit(limit)
      .lean();
  }

  async incrementPending(id, amount) {
    return this.model.findByIdAndUpdate(
      id,
      {
        $inc: { pendingAmount: amount, totalPurchased: amount, invoiceCount: 1 },
        $set: { lastInvoiceAt: new Date() },
      },
      { new: true }
    );
  }

  async decrementPending(id, amount) {
    return this.model.findByIdAndUpdate(
      id,
      { $inc: { pendingAmount: -amount } },
      { new: true }
    );
  }
}

module.exports = new DealerRepository();
