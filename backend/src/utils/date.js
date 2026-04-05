/**
 * Date utility for dashboard summaries
 */

const startOfMonth = (date = new Date()) => {
  return new Date(date.getFullYear(), date.getMonth(), 1);
};

const startOfYear = (date = new Date()) => {
  return new Date(date.getFullYear(), 0, 1);
};

module.exports = {
  startOfMonth,
  startOfYear,
};
