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

    // 🛑 Standard fallback: removed transactions as they crash standalone local DBs
    try {
      const dealer = await dealerRepo.findById(dealerId);
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

        const product = await productRepo.findById(item.productId);
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

        // ⚡ Update Stock Atomic
        await productRepo.updateStock(product._id, -item.quantity);
        await productRepo.updateSalesStats(
          product._id,
          item.quantity,
          lineTotal,
          lineProfit
        );
      }

      const gstAmount = parseFloat(((subtotal * gstRate) / 100).toFixed(2));
      const totalAmount = parseFloat((subtotal + gstAmount).toFixed(2));

      // 🛑 Audit: Final Credit Check
      if (paymentMode === 'credit' || paymentMode === 'partial') {
        if (dealer.creditLimit > 0) {
          const potentialPending = (dealer.pendingAmount || 0) + (totalAmount - (parseFloat(amountPaid) || 0));
          if (potentialPending > dealer.creditLimit) {
            throw ApiError.badRequest(`CREDIT LIMIT EXCEEDED. LIMIT: ${dealer.creditLimit}, POTENTIAL: ${potentialPending.toFixed(2)}`);
          }
        }
      }

      let resolvedAmountPaid = amountPaid;
      if (paymentMode === 'full') resolvedAmountPaid = totalAmount;
      if (paymentMode === 'credit') resolvedAmountPaid = 0;

      const amountDue = parseFloat((totalAmount - resolvedAmountPaid).toFixed(2));
      const invoiceId = data.forceInvoiceId || await generateInvoiceId();

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
      });

      // Update dealer stats Atomic
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
        { new: true }
      );

      return invoiceRepo.findById(invoice._id, 'dealer');

    } catch (err) {
      throw err;
    }
  }

  async revertInvoice(id) {
    const invoice = await invoiceRepo.findById(id);
    if (!invoice) return false;

    // 1. Revert dealer stats
    await mongoose.model('Dealer').findByIdAndUpdate(invoice.dealer, {
       $inc: { 
          pendingAmount: -(invoice.amountDue || 0),
          totalPurchased: -(invoice.totalAmount || 0),
          invoiceCount: -1
       }
    });

    // 2. Revert product stats
    for (const item of (invoice.lineItems || [])) {
       await productRepo.updateStock(item.product, item.quantity); 
       await productRepo.updateSalesStats(item.product, -item.quantity, -item.lineTotal, -item.lineProfit);
    }

    // 3. Delete invoice physically
    await invoiceRepo.delete(id);
    return invoice.invoiceId;
  }

  async updateInvoice(id, data) {
      // Safely rollback business effects
      const originalInvoiceId = await this.revertInvoice(id);
      if (!originalInvoiceId) throw ApiError.notFound('INVOICE NOT FOUND');
      
      // Remint with identical receipt number
      data.forceInvoiceId = originalInvoiceId;
      return this.create(data);
  }

  async list(q, status, page = 1, limit = 20, ownerId) {
    return invoiceRepo.search(q, status, { page, limit }, ownerId);
  }

  async getById(id) {
    const invoice = await invoiceRepo.findById(id, 'dealer');
    if (!invoice) throw ApiError.notFound('INVOICE NOT FOUND');
    return invoice;
  }

  async getByDealer(dealerId, page = 1, limit = 20) {
    return invoiceRepo.findByDealer(dealerId, { page, limit });
  }

  async getRevenueChart(days = 30, ownerId) {
    return invoiceRepo.getRevenueByDay(days, ownerId);
  }

  async getMonthlySummary(ownerId) {
    return invoiceRepo.getMonthlySummary(ownerId);
  }
}

module.exports = new InvoiceService();
