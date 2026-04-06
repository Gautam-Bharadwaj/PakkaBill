const BaseRepository = require('./Base.repository');
const Payment = require('../models/Payment.model');

class PaymentRepository extends BaseRepository {
  constructor() {
    super(Payment);
  }

  async findByInvoice(invoiceId) {
    return this.model
      .find({ invoice: invoiceId })
      .sort({ createdAt: -1 })
      .populate('dealer', 'name shopName')
      .lean();
  }

  async findByDealer(dealerId, options = {}) {
    return this.findAll({ dealer: dealerId }, { ...options, sort: { createdAt: -1 } });
  }

  async totalPaidForInvoice(invoiceId) {
    const [result] = await this.aggregate([
      { $match: { invoice: invoiceId } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);
    return result ? result.total : 0;
  }
}

module.exports = new PaymentRepository();
