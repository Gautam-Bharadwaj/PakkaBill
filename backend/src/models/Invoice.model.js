const mongoose = require('mongoose');

const lineItemSchema = new mongoose.Schema(
  {
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    productSnapshot: {
      name: String,
      sellingPrice: Number,
      manufacturingCost: Number,
    },
    quantity: { type: Number, required: true, min: 1 },
    unitPrice: { type: Number, required: true, min: 0 },
    discount: { type: Number, default: 0, min: 0 },
    lineTotal: { type: Number, required: true },
    lineProfit: { type: Number, required: true },
  },
  { _id: false }
);

const invoiceSchema = new mongoose.Schema(
  {
    invoiceId: { type: String, required: true, unique: true, index: true },
    dealerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Dealer', required: true, index: true },
    dealerSnapshot: {
      name: String,
      phone: String,
      shopName: String,
    },
    items: [lineItemSchema],
    subtotal: { type: Number, required: true },
    discountTotal: { type: Number, default: 0 },
    gstRate: { type: Number, enum: [0, 5, 12, 18], default: 0 },
    gstAmount: { type: Number, default: 0 },
    totalAmount: { type: Number, required: true },
    totalProfit: { type: Number, required: true },
    amountPaid: { type: Number, default: 0, min: 0 },
    amountDue: { type: Number, required: true, min: 0 },
    paymentStatus: {
      type: String,
      enum: ['unpaid', 'partial', 'paid'],
      default: 'unpaid',
      index: true,
    },
    pdfPath: { type: String, default: null },
    pdfUrl: { type: String, default: null },
  },
  { timestamps: true }
);

invoiceSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Invoice', invoiceSchema);
