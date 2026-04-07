/**
 * Formats a number as Indian Rupee string.
 * Always use this — never display raw numbers in UI.
 */
export const formatINR = (amount, decimals = 2) => {
  const num = Number(amount) || 0;
  return `₹${num.toLocaleString('en-IN', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })}`;
};

export const parseINR = (str) => {
  if (!str) return 0;
  return parseFloat(str.replace(/[₹,]/g, '')) || 0;
};

/**
 * Audit Tool: Precision Calculation
 * Prevents JS floating point errors (0.1 + 0.2 !== 0.3)
 */
export const calc = {
  add: (a, b) => parseFloat(((Number(a) || 0) + (Number(b) || 0)).toFixed(2)),
  sub: (a, b) => parseFloat(((Number(a) || 0) - (Number(b) || 0)).toFixed(2)),
  mul: (a, b) => parseFloat(((Number(a) || 0) * (Number(b) || 0)).toFixed(2)),
  div: (a, b) => {
    const den = Number(b) || 0;
    return den === 0 ? 0 : parseFloat(((Number(a) || 0) / den).toFixed(2));
  },
  percent: (amount, rate) => parseFloat(((Number(amount) || 0) * (Number(rate) || 0) / 100).toFixed(2)),
  discount: (amount, rate) => parseFloat(((Number(amount) || 0) * (1 - (Number(rate) || 0) / 100)).toFixed(2)),
};
