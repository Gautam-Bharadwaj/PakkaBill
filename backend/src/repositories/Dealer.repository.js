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

    // Apply exact status filtering (e.g. 'active', 'blocked')
    if (options.status && options.status.toLowerCase() !== 'all') {
      filter.status = options.status.toLowerCase();
    }

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

  async incrementPending(id, amount, options = {}) {
    return this.model.findByIdAndUpdate(
      id,
      {
        $inc: { pendingAmount: amount, totalPurchased: amount, invoiceCount: 1 },
        $set: { lastInvoiceAt: new Date() },
      },
      { new: true, ...options }
    );
  }

  async decrementPending(id, amount, options = {}) {
    return this.model.findByIdAndUpdate(
      id,
      { $inc: { pendingAmount: -amount } },
      { new: true, ...options }
    );
  }

  async adjustPendingOnly(id, amount, options = {}) {
    return this.model.findByIdAndUpdate(
      id,
      { $inc: { pendingAmount: amount } },
      { new: true, ...options }
    );
  }
}

module.exports = new DealerRepository();
