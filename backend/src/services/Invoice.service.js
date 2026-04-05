const mongoose = require('mongoose');
const { ApiError } = require('../utils/ApiError');
const { DealerRepository } = require('../repositories/Dealer.repository');
const { ProductRepository } = require('../repositories/Product.repository');
const { InvoiceRepository } = require('../repositories/Invoice.repository');
const { calculateGst, derivePaymentStatus } = require('../utils/calculations');
const { generateInvoiceId } = require('../utils/invoiceId');
const { InvoiceFactory } = require('./factories/Invoice.factory');
const pdfService = require('./PDF.service');
const notification = require('./Notification.service');
const InvoiceModel = require('../models/Invoice.model');
const ProductModel = require('../models/Product.model');

const dealerRepo = new DealerRepository();
const productRepo = new ProductRepository();
const invoiceRepo = new InvoiceRepository();
const factory = new InvoiceFactory();


class InvoiceService {
  async previewInvoice({ dealerId, items, gstRate = 0 }) {
    const dealer = await dealerRepo.findOneActive({ _id: dealerId });
    if (!dealer) throw ApiError.notFound('Dealer not found');

    let subtotal = 0;
    let discountTotal = 0;
    let totalProfit = 0;
    const lines = [];

    for (const item of items) {
      const product = await productRepo.findByIdAvailable(item.productId);
      if (!product) throw ApiError.badRequest(`Invalid product ${item.productId}`);
      const line = factory.buildLine(product, { ...item, dealer });
      subtotal += line.lineTotal;
      discountTotal += line.discount;
      totalProfit += line.lineProfit;
      lines.push({
        productId: item.productId,
        name: product.name,
        lineRevenue: line.lineTotal,
        lineProfit: line.lineProfit,
      });
    }

    const gstAmount = calculateGst(subtotal, gstRate);
    const totalAmount = subtotal + gstAmount;
    const creditAfter = dealer.pendingAmount + derivePaymentStatus(0, totalAmount).amountDue;

    return {
      subtotal,
      discountTotal,
      gstRate,
      gstAmount,
      totalAmount,
      totalProfit,
      dealerPending: dealer.pendingAmount,
      creditLimit: dealer.creditLimit,
      wouldExceedCredit: creditAfter > dealer.creditLimit,
      lines,
    };
  }

  async createInvoice({ dealerId, items, gstRate = 0, paymentMode, amountPaid: paidInput = 0 }) {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      const dealer = await dealerRepo.findOneActive({ _id: dealerId }).session(session);
      if (!dealer) throw ApiError.notFound('Dealer not found');

      const lineDocs = [];
      let subtotal = 0;
      let discountTotal = 0;
      let totalProfit = 0;

      for (const item of items) {
        const product = await ProductModel.findById(item.productId).session(session);
        if (!product || product.isArchived === true) {
          throw ApiError.badRequest(`Invalid product ${item.productId}`);
        }

        if (product.stockQuantity < item.quantity) {
          throw ApiError.badRequest(`Insufficient stock for ${product.name}`);
        }

        const line = factory.buildLine(product, { ...item, dealer });
        lineDocs.push(line);
        subtotal += line.lineTotal;
        discountTotal += line.discount;
        totalProfit += line.lineProfit;

        product.stockQuantity -= item.quantity;
        await product.save({ session });
      }

      const gstAmount = calculateGst(subtotal, gstRate);
      const totalAmount = subtotal + gstAmount;

      let amountPaid = 0;
      if (paymentMode === 'full') amountPaid = totalAmount;
      else if (paymentMode === 'partial') amountPaid = paidInput;
      else amountPaid = 0;

      const { amountDue, paymentStatus } = derivePaymentStatus(amountPaid, totalAmount);

      if (dealer.pendingAmount + amountDue > dealer.creditLimit) {
        throw ApiError.badRequest('Credit limit exceeded — reduce amount due or increase limit', 'CREDIT_EXCEEDED');
      }

      const invoiceId = await generateInvoiceId();

      const invoice = new InvoiceModel({
        invoiceId,
        dealerId: dealer._id,
        dealerSnapshot: {
          name: dealer.name,
          phone: dealer.phone,
          shopName: dealer.shopName,
        },
        items: lineDocs,
        subtotal,
        discountTotal,
        gstRate,
        gstAmount,
        totalAmount,
        totalProfit,
        amountPaid,
        amountDue,
        paymentStatus,
      });

      dealer.pendingAmount += amountDue;
      dealer.totalPurchased += totalAmount;
      await dealer.save({ session });
      await invoice.save({ session });

      await session.commitTransaction();

      const populated = await InvoiceModel.findById(invoice._id).lean();

      const pdfPath = await pdfService.generateInvoicePdf({
        invoice: populated,
        businessName: process.env.BUSINESS_NAME,
        businessAddress: process.env.BUSINESS_ADDRESS,
        gstin: process.env.BUSINESS_GSTIN,
        upi: process.env.UPI_VPA,
        payeeName: process.env.UPI_PAYEE_NAME,
      });
      await InvoiceModel.updateOne({ _id: invoice._id }, { pdfPath, pdfUrl: pdfPath });

      await notification.emit('invoice.created', {
        invoice: { ...populated, pdfPath },
        dealer,
      });

      return { ...populated, pdfPath };
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  async listInvoices(query) {
    return invoiceRepo.listWithFilters(query);
  }

  async getInvoice(id) {
    return invoiceRepo.findById(id).lean();
  }

  async sendWhatsAppResend(invoiceId) {
    const invoice = await InvoiceModel.findById(invoiceId);
    if (!invoice) throw ApiError.notFound('Invoice not found');
    const dealer = await dealerRepo.findById(invoice.dealerId);
    if (!dealer) throw ApiError.notFound('Dealer not found');
    await notification.emit('invoice.created', { invoice: invoice.toObject(), dealer });
    return { ok: true };
  }
}

module.exports = new InvoiceService();
