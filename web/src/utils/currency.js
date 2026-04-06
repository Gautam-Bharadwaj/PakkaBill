export const formatINR = (amount, decimals = 2) => {
  const num = Number(amount) || 0;
  return `₹${num.toLocaleString('en-IN', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}`;
};
