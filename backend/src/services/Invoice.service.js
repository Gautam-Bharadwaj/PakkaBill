const mongoose = require('mongoose');
const invoiceRepo = require('../repositories/Invoice.repository');
const dealerRepo = require('../repositories/Dealer.repository');
const productRepo = require('../repositories/Product.repository');
const ApiError = require('../utils/ApiError');
const { generateInvoiceId } = require('../utils/invoiceId');

class InvoiceService {
  /**
   * PATTERN: Facade — orchestrates Dealer, Product, Payment interactions.
   */
  async create(data) {
    const { dealerId, lineItems, gstRate = 0, paymentMode = 'credit', amountPaid = 0 } = data;

    const dealer = await dealerRepo.findById(dealerId);
    if (!dealer) throw ApiError.notFound('Dealer not found');

    // Validate + enrich line items
    let subtotal = 0;
    let discountTotal = 0;
    let totalProfit = 0;
    const enrichedItems = [];

    for (const item of lineItems) {
      const product = await productRepo.findById(item.productId);
      if (!product) throw ApiError.notFound(`Product ${item.productId} not found`);

      const unitPrice = item.unitPrice ?? product.sellingPrice;
      const discountPercent = item.discountPercent ?? 0;
      const discountedPrice = unitPrice * (1 - discountPercent / 100);
      const lineTotal = parseFloat((discountedPrice * item.quantity).toFixed(2));
      const lineDiscount = parseFloat(((unitPrice - discountedPrice) * item.quantity).toFixed(2));
      const lineProfit = parseFloat(
        ((discountedPrice - (product.manufacturingCost || 0)) * item.quantity).toFixed(2)
      );

      subtotal += lineTotal;
      discountTotal += lineDiscount;
      totalProfit += lineProfit;

      enrichedItems.push({
        product: product._id,
        productName: product.name,
        quantity: item.quantity,
        unitPrice,
        discountPercent,
        lineTotal,
        lineProfit,
        manufacturingCost: product.manufacturingCost || 0,
      });
    }

    const gstAmount = parseFloat(((subtotal * gstRate) / 100).toFixed(2));
    const totalAmount = parseFloat((subtotal + gstAmount).toFixed(2));

    let resolvedAmountPaid = amountPaid;
    if (paymentMode === 'full') resolvedAmountPaid = totalAmount;
    if (paymentMode === 'credit') resolvedAmountPaid = 0;

    const amountDue = parseFloat((totalAmount - resolvedAmountPaid).toFixed(2));

    const invoiceId = await generateInvoiceId();

    const invoice = await invoiceRepo.create({
      invoiceId,
      dealer: dealer._id,
      dealerName: dealer.name,
      dealerShop: dealer.shopName,
      dealerPhone: dealer.phone,
      lineItems: enrichedItems,
      subtotal,
      discountTotal,
      gstRate,
      gstAmount,
      totalAmount,
      totalProfit,
      amountPaid: resolvedAmountPaid,
      amountDue,
      paymentMode,
    });

    // Update dealer pending & stats
    await dealerRepo.incrementPending(dealer._id, amountDue);

    // Update product stock and sales stats
    for (const item of enrichedItems) {
      await productRepo.updateStock(item.product, -item.quantity);
      await productRepo.updateSalesStats(
        item.product,
        item.quantity,
        item.lineTotal,
        item.lineProfit
      );
    }

    return invoiceRepo.findById(invoice._id, 'dealer');
  }

  async list(status, page = 1, limit = 20) {
    return invoiceRepo.findByStatus(status, { page, limit });
  }

  async getById(id) {
    const invoice = await invoiceRepo.findById(id, 'dealer');
    if (!invoice) throw ApiError.notFound('Invoice not found');
    return invoice;
  }

  async getByDealer(dealerId, page = 1, limit = 20) {
    return invoiceRepo.findByDealer(dealerId, { page, limit });
  }

  async getRevenueChart(days = 30) {
    return invoiceRepo.getRevenueByDay(days);
  }

  async getMonthlySummary() {
    return invoiceRepo.getMonthlySummary();
  }
}

module.exports = new InvoiceService();
