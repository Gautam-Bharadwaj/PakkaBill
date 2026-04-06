/**
 * Generates a UPI deep-link / QR-code string
 * upi://pay?pa=VPA&pn=NAME&am=AMOUNT&tn=NOTE&cu=INR
 */
const generateUpiLink = ({ vpa, name, amount, note = '' }) => {
  const params = new URLSearchParams({
    pa: vpa,
    pn: name,
    am: amount.toFixed(2),
    tn: note.substring(0, 100),
    cu: 'INR',
  });
  return `upi://pay?${params.toString()}`;
};

module.exports = { generateUpiLink };
