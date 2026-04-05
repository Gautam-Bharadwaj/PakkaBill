const { FlatDiscountStrategy } = require('../strategies/discount.strategy');

/**
 * Factory — builds normalized line DTOs for {@link InvoiceService}.
 */
class InvoiceFactory {
  constructor(discountStrategy = new FlatDiscountStrategy()) {
    this.discountStrategy = discountStrategy;
  }

  buildLine(product, row) {
    const unitPrice = row.unitPrice != null ? row.unitPrice : product.sellingPrice;
    const discount = row.discount || 0;
    const lineTotal = this.discountStrategy.apply({
      quantity: row.quantity,
      unitPrice,
      discount,
      dealer: row.dealer,
    });
    const lineProfit = lineTotal - row.quantity * product.manufacturingCost;
    return {
      productId: product._id,
      productSnapshot: {
        name: product.name,
        sellingPrice: product.sellingPrice,
        manufacturingCost: product.manufacturingCost,
      },
      quantity: row.quantity,
      unitPrice,
      discount,
      lineTotal,
      lineProfit,
    };
  }
}

module.exports = { InvoiceFactory };
