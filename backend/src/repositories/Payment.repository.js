const { BaseRepository } = require('./Base.repository');
const PaymentModel = require('../models/Payment.model');

class PaymentRepository extends BaseRepository {
  constructor() {
    super(PaymentModel);
  }

  findByInvoice(invoiceId) {
    return this.model.find({ invoiceId }).sort({ recordedAt: -1 }).lean();
  }

  findByDealer(dealerId, limit = 200) {
    return this.model.find({ dealerId }).sort({ recordedAt: -1 }).limit(limit).lean();
  }

  findAllSorted(limit = 500) {
    return this.model.find().sort({ recordedAt: -1 }).limit(limit).lean();
  }
}

module.exports = { PaymentRepository };
