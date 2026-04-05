const { BaseRepository } = require('./Base.repository');
const InvoiceModel = require('../models/Invoice.model');

class InvoiceRepository extends BaseRepository {
  constructor() {
    super(InvoiceModel);
  }

  findByInvoiceId(invoiceId) {
    return this.model.findOne({ invoiceId });
  }

  listWithFilters({ dealerId, from, to, paymentStatus } = {}) {
    const filter = {};
    if (dealerId) filter.dealerId = dealerId;
    if (paymentStatus) filter.paymentStatus = paymentStatus;
    if (from || to) {
      filter.createdAt = {};
      if (from) filter.createdAt.$gte = new Date(from);
      if (to) filter.createdAt.$lte = new Date(to);
    }
    return this.model.find(filter).sort({ createdAt: -1 }).limit(500).lean();
  }
}

module.exports = { InvoiceRepository };
