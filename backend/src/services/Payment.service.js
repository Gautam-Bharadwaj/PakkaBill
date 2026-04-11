const paymentRepo = require('../repositories/Payment.repository');
const invoiceRepo = require('../repositories/Invoice.repository');
const dealerRepo = require('../repositories/Dealer.repository');
const ApiError = require('../utils/ApiError');

class PaymentService {
  async recordPayment({ invoiceId, amount, mode, upiReference = '', note = '', userId }) {
    try {
      const invoice = await invoiceRepo.findById(invoiceId);
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
      });

      const newAmountPaid = (invoice.amountPaid || 0) + amount;
      const newAmountDue = parseFloat((invoice.totalAmount - newAmountPaid).toFixed(2));
      
      let newStatus = 'unpaid';
      if (newAmountDue <= 0.05) newStatus = 'paid';
      else if (newAmountPaid > 0) newStatus = 'partial';

      await invoiceRepo.update(invoice._id, {
        amountPaid: newAmountPaid,
        amountDue: Math.max(0, newAmountDue),
        paymentStatus: newStatus,
      });

      // Update dealer pending Atomic
      await dealerRepo.decrementPending(invoice.dealer, amount);

      return payment;
    } catch (err) {
      throw err;
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

  async deletePayment(id) {
    try {
      const payment = await paymentRepo.findById(id);
      if (!payment) throw ApiError.notFound('Payment not found');

      const invoice = await invoiceRepo.findById(payment.invoice);
      if (!invoice) throw ApiError.notFound('Invoice relative to payment not found');

      // 1. Revert invoice totals
      const newAmountPaid = Math.max(0, (invoice.amountPaid || 0) - payment.amount);
      const newAmountDue = parseFloat((invoice.totalAmount - newAmountPaid).toFixed(2));
      
      let newStatus = 'unpaid';
      if (newAmountDue <= 0.05) newStatus = 'paid';
      else if (newAmountPaid > 0) newStatus = 'partial';

      await invoiceRepo.update(invoice._id, {
        amountPaid: newAmountPaid,
        amountDue: newAmountDue,
        paymentStatus: newStatus,
      });

      // 2. Revert dealer pending Global
      await dealerRepo.adjustPendingOnly(invoice.dealer, payment.amount);

      // 3. Delete record
      return paymentRepo.delete(id);
    } catch (err) {
      throw err;
    }
  }
}

module.exports = new PaymentService();
