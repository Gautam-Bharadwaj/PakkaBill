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
  return parseFloat(str.replace(/[₹,]/g, '')) || 0;
};
