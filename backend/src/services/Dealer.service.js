const { ApiError } = require('../utils/ApiError');
const { DealerRepository } = require('../repositories/Dealer.repository');
const InvoiceModel = require('../models/Invoice.model');
const PaymentModel = require('../models/Payment.model');

const dealerRepo = new DealerRepository();

function enrich(dealer) {
  if (!dealer) return null;
  const d = dealer.toObject ? dealer.toObject() : dealer;
  return {
    ...d,
    creditUtilization: d.creditLimit > 0 ? d.pendingAmount / d.creditLimit : 0,
    overLimit: d.pendingAmount > d.creditLimit,
  };
}

class DealerService {
  async list({ q, minPending, maxPending }) {
    const conditions = [DealerRepository.activeFilter()];
    if (q) {
      conditions.push({
        $or: [
          { name: new RegExp(q, 'i') },
          { phone: new RegExp(q, 'i') },
          { shopName: new RegExp(q, 'i') },
        ],
      });
    }
    const pending = {};
    if (minPending != null) pending.$gte = Number(minPending);
    if (maxPending != null) pending.$lte = Number(maxPending);
    if (Object.keys(pending).length) conditions.push({ pendingAmount: pending });

    const filter = conditions.length === 1 ? conditions[0] : { $and: conditions };
    const dealers = await dealerRepo.model.find(filter).sort({ name: 1 }).lean();
    return dealers.map(enrich);
  }

  async getById(id) {
    const d = await dealerRepo.findOneActive({ _id: id }).lean();
    if (!d) throw ApiError.notFound('Dealer not found');
    return enrich(d);
  }

  async create(data) {
    const dealer = await dealerRepo.create({ ...data, isActive: true });
    return dealer;
  }

  async update(id, data) {
    const dealer = await dealerRepo.updateById(id, data, { new: true });
    if (!dealer) throw ApiError.notFound('Dealer not found');
    return dealer;
  }

  async softDelete(id) {
    const dealer = await dealerRepo.updateById(
      id,
      { isActive: false },
      { new: true }
    );
    if (!dealer) throw ApiError.notFound('Dealer not found');
    return { ok: true };
  }

  async purchaseHistory(dealerId) {
    const exists = await dealerRepo.findOneActive({ _id: dealerId }).select('_id').lean();
    if (!exists) throw ApiError.notFound('Dealer not found');
    return InvoiceModel.find({ dealerId }).sort({ createdAt: -1 }).lean();
  }

  async paymentsForDealer(dealerId) {
    return PaymentModel.find({ dealerId }).sort({ recordedAt: -1 }).limit(200).lean();
  }
}

module.exports = new DealerService();
