/**
 * Strategy pattern — swappable discount application for invoice lines.
 */
class FlatDiscountStrategy {
  apply({ quantity, unitPrice, discount }) {
    return Math.max(0, quantity * unitPrice - (discount || 0));
  }
}

class PercentageDiscountStrategy {
  constructor(percent) {
    this.percent = percent;
  }

  apply({ quantity, unitPrice, discount }) {
    const base = quantity * unitPrice;
    const pct = ((discount != null ? discount : 0) / 100) * base;
    return Math.max(0, base - pct);
  }
}

class DealerTierDiscountStrategy {
  /** Example: high-volume dealers get extra % off list — placeholder */
  apply({ quantity, unitPrice, discount, dealer }) {
    const tierPct = dealer?.totalPurchased > 1_000_000 ? 2 : 0;
    const base = quantity * unitPrice * (1 - tierPct / 100);
    return Math.max(0, base - (discount || 0));
  }
}

module.exports = { FlatDiscountStrategy, PercentageDiscountStrategy, DealerTierDiscountStrategy };
