/**
 * GST calculation utility
 * @param {number} subtotal
 * @param {number} rate
 * @returns {number}
 */
const calculateGst = (subtotal, rate = 0) => {
  return rate ? (subtotal * rate) / 100 : 0;
};

/**
 * Derives payment status and amount due
 * @param {number} amountPaid
 * @param {number} totalAmount
 * @returns {{ amountDue: number, paymentStatus: 'unpaid' | 'paid' | 'partial' }}
 */
const derivePaymentStatus = (amountPaid, totalAmount) => {
  if (amountPaid <= 0) {
    return { amountDue: totalAmount, paymentStatus: 'unpaid' };
  }
  if (amountPaid >= totalAmount - 0.01) {
    return { amountDue: 0, paymentStatus: 'paid' };
  }
  return { amountDue: totalAmount - amountPaid, paymentStatus: 'partial' };
};

module.exports = {
  calculateGst,
  derivePaymentStatus,
};
