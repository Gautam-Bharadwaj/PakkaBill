const mongoose = require('mongoose');
const { ApiError } = require('../utils/ApiError');
const InvoiceModel = require('../models/Invoice.model');
const PaymentModel = require('../models/Payment.model');
const DealerModel = require('../models/Dealer.model');
const { derivePaymentStatus } = require('../utils/calculations');
const notification = require('./Notification.service');


class PaymentService {
  async recordPayment({ invoiceId, amount, mode, upiRef = '', note = '' }) {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      const invoice = await InvoiceModel.findById(invoiceId).session(session);
      if (!invoice) throw ApiError.notFound('Invoice not found');

      if (amount > invoice.amountDue + 0.01) {
        throw ApiError.badRequest('Payment exceeds amount due');
      }

      const dealer = await DealerModel.findById(invoice.dealerId).session(session);
      if (!dealer) throw ApiError.badRequest('Dealer missing');

      invoice.amountPaid += amount;
      invoice.amountDue -= amount;
      invoice.paymentStatus = derivePaymentStatus(invoice.amountPaid, invoice.totalAmount).paymentStatus;
      await invoice.save({ session });

      dealer.pendingAmount = Math.max(0, dealer.pendingAmount - amount);
      await dealer.save({ session });

      const [payment] = await PaymentModel.create(
        [
          {
            invoiceId: invoice._id,
            dealerId: invoice.dealerId,
            amount,
            mode,
            upiRef: upiRef || '',
            note: note || '',
          },
        ],
        { session }
      );

      await session.commitTransaction();

      await notification.emit('payment.recorded', {
        invoice: invoice.toObject(),
        dealer,
        amount,
      });

      return { payment, invoice };
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  async listAll(limit = 500) {
    return PaymentModel.find().sort({ recordedAt: -1 }).limit(limit).lean();
  }
}

module.exports = new PaymentService();
