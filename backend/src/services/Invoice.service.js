const mongoose = require('mongoose');
const invoiceRepo = require('../repositories/Invoice.repository');
const dealerRepo = require('../repositories/Dealer.repository');
const productRepo = require('../repositories/Product.repository');
const ApiError = require('../utils/ApiError');
const { generateInvoiceId } = require('../utils/invoiceId');

class InvoiceService {
  /**
   * PATTERN: Transactional Facade
   * Orchestrates Dealer, Product, and Payment updates with ACID compliance via Mongoose sessions.
   */
  async create(data) {
    const { 
      dealerId, 
      lineItems = [], 
      gstRate = 0, 
      paymentMode = 'credit', 
      amountPaid = 0 
    } = data;

    // 🐞 Fix: Block empty invoices
    if (!lineItems || lineItems.length === 0) {
      throw ApiError.badRequest('INVOICE MUST CONTAIN AT LEAST ONE ITEM');
    }

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const dealer = await dealerRepo.findById(dealerId, '', { session });
      if (!dealer) throw ApiError.notFound('DEALER NOT FOUND');

      // 🏦 Audit: Credit Limit Enforcement
      // Note: We'll calculate the total later, but we need to track if this dealer can even buy on credit.
      if (paymentMode === 'credit' && dealer.status === 'blocked') {
        throw ApiError.badRequest('ACCOUNT IS BLOCKED. CANNOT ISSUE CREDIT.');
      }

      let subtotal = 0;
      let totalProfit = 0;
      const enrichedItems = [];

      for (const item of lineItems) {
        if (!item.productId || !item.quantity || item.quantity <= 0) {
          throw ApiError.badRequest('INVALID LINE ITEM: PRODUCT ID AND QUANTITY REQUIRED');
        }

        const product = await productRepo.findById(item.productId, '', { session });
        if (!product) throw ApiError.notFound(`PRODUCT ${item.productId} NOT FOUND`);

        // 📦 Audit: Inventory Guardrails
        if (product.stockQuantity < item.quantity) {
          throw ApiError.badRequest(`INSUFFICIENT STOCK FOR ${product.name}. AVAILABLE: ${product.stockQuantity}`);
        }

        const unitPrice = item.unitPrice ?? product.sellingPrice;
        const discountPercent = item.discountPercent ?? 0;
        const discountedPrice = unitPrice * (1 - discountPercent / 100);
        
        const lineTotal = parseFloat((discountedPrice * item.quantity).toFixed(2));
        const lineProfit = parseFloat(
          ((discountedPrice - (product.manufacturingCost || 0)) * item.quantity).toFixed(2)
        );

        subtotal += lineTotal;
        totalProfit += lineProfit;

        enrichedItems.push({
          product: product._id,
          productName: product.name,
          sku: product.sku || 'N/A',
          quantity: item.quantity,
          unitPrice,
          discountPercent,
          lineTotal,
          lineProfit,
          manufacturingCost: product.manufacturingCost || 0,
        });

        // ⚡ Update Stock Atomic within transaction
        await productRepo.updateStock(product._id, -item.quantity, { session });
        await productRepo.updateSalesStats(
          product._id,
          item.quantity,
          lineTotal,
          lineProfit,
          { session }
        );
      }

      const gstAmount = parseFloat(((subtotal * gstRate) / 100).toFixed(2));
      const totalAmount = parseFloat((subtotal + gstAmount).toFixed(2));

      // 🛑 Audit: Final Credit Check
      if (paymentMode === 'credit' || paymentMode === 'partial') {
        const potentialPending = (dealer.pendingAmount || 0) + (totalAmount - (parseFloat(amountPaid) || 0));
        if (potentialPending > (dealer.creditLimit || 0)) {
          throw ApiError.badRequest(`CREDIT LIMIT EXCEEDED. LIMIT: ${dealer.creditLimit}, POTENTIAL: ${potentialPending.toFixed(2)}`);
        }
      }

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
        gstRate,
        gstAmount,
        totalAmount,
        totalProfit,
        amountPaid: resolvedAmountPaid,
        amountDue,
        paymentMode,
      }, { session });

      // Update dealer stats Atomic
      // Note: We use incrementPending which should now respect the session if called correctly
      // but let's just use the direct model update here to be 100% sure with session
      await mongoose.model('Dealer').findByIdAndUpdate(
        dealer._id,
        {
          $inc: { 
            pendingAmount: amountDue, 
            totalPurchased: totalAmount, 
            invoiceCount: 1 
          },
          $set: { lastInvoiceAt: new Date() },
        },
        { session, new: true }
      );

      await session.commitTransaction();
      return invoiceRepo.findById(invoice._id, 'dealer');

    } catch (err) {
      await session.abortTransaction();
      throw err;
    } finally {
      session.endSession();
    }
  }

  async list(status, page = 1, limit = 20) {
    return invoiceRepo.findByStatus(status, { page, limit });
  }

  async getById(id) {
    const invoice = await invoiceRepo.findById(id, 'dealer');
    if (!invoice) throw ApiError.notFound('INVOICE NOT FOUND');
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
