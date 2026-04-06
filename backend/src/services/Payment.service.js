const paymentRepo = require('../repositories/Payment.repository');
const invoiceRepo = require('../repositories/Invoice.repository');
const dealerRepo = require('../repositories/Dealer.repository');
const ApiError = require('../utils/ApiError');

class PaymentService {
  async recordPayment({ invoiceId, amount, mode, upiReference = '', note = '', userId }) {
    const invoice = await invoiceRepo.findById(invoiceId);
    if (!invoice) throw ApiError.notFound('Invoice not found');

    if (amount > invoice.amountDue + 0.01) {
      throw ApiError.badRequest(`Amount exceeds due amount of ₹${invoice.amountDue}`);
    }

    const payment = await paymentRepo.create({
      invoice: invoice._id,
      dealer: invoice.dealer,
      amount,
      mode,
      upiReference,
      note,
      recordedBy: userId,
    });

    // Update invoice
    const newAmountPaid = parseFloat((invoice.amountPaid + amount).toFixed(2));
    const newAmountDue = parseFloat((invoice.amountDue - amount).toFixed(2));
    await invoiceRepo.update(invoice._id, {
      amountPaid: newAmountPaid,
      amountDue: Math.max(0, newAmountDue),
    });

    // Update dealer pending
    await dealerRepo.decrementPending(invoice.dealer, amount);

    return payment;
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
