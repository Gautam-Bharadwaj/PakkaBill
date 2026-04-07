const paymentRepo = require('../repositories/Payment.repository');
const invoiceRepo = require('../repositories/Invoice.repository');
const dealerRepo = require('../repositories/Dealer.repository');
const ApiError = require('../utils/ApiError');

class PaymentService {
  async recordPayment({ invoiceId, amount, mode, upiReference = '', note = '', userId }) {
    const mongoose = require('mongoose');
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const invoice = await invoiceRepo.findById(invoiceId, '', { session });
      if (!invoice) throw ApiError.notFound('Invoice not found');

      const actualDue = Math.max(0, invoice.amountDue || 0);
      if (amount > actualDue + 0.1) {
        throw ApiError.badRequest(`Amount ₹${amount.toFixed(2)} exceeds due ₹${actualDue.toFixed(2)}`);
      }

      const payment = await paymentRepo.create({
        invoice: invoice._id,
        dealer: invoice.dealer,
        amount,
        mode,
        upiReference,
        note,
        recordedBy: userId,
      }, { session });

      // Update invoice 
      // Status is handled by Pre-Save hook in model automatically
      await invoiceRepo.update(invoice._id, {
        $inc: { amountPaid: amount }
      }, { session });

      // Update dealer pending Atomic
      await dealerRepo.decrementPending(invoice.dealer, amount, { session });

      await session.commitTransaction();
      return payment;
    } catch (err) {
      await session.abortTransaction();
      throw err;
    } finally {
      session.endSession();
    }
  }

  async getPaymentsByInvoice(invoiceId) {
    return paymentRepo.findByInvoice(invoiceId);
  }

  async getPaymentsByDealer(dealerId, page = 1, limit = 20) {
    return paymentRepo.findByDealer(dealerId, { page, limit });
  }

  async generateQrData(invoiceId) {
    const { generateUpiLink } = require('../utils/upiLink');
    const { UPI_VPA, UPI_NAME } = require('../config/env');

    const invoice = await invoiceRepo.findById(invoiceId, 'dealer');
    if (!invoice) throw ApiError.notFound('Invoice not found');

    const upiLink = generateUpiLink({
      vpa: UPI_VPA,
      name: UPI_NAME,
      amount: invoice.amountDue,
      note: invoice.invoiceId,
    });

    return {
      upiLink,
      upiVpa: UPI_VPA,
      upiName: UPI_NAME,
      amount: invoice.amountDue,
      invoiceId: invoice.invoiceId,
    };
  }
}

module.exports = new PaymentService();
