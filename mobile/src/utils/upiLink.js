export const generateUpiLink = ({ vpa, name, amount, note = '' }) => {
  const params = new URLSearchParams({
    pa: vpa,
    pn: name,
    am: Number(amount).toFixed(2),
    tn: note.substring(0, 100),
    cu: 'INR',
  });
  return `upi://pay?${params.toString()}`;
};
