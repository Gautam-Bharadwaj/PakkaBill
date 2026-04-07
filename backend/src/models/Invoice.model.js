const mongoose = require('mongoose');

const lineItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  productName: { type: String, required: true },
  quantity: { type: Number, required: true, min: 1 },
  unitPrice: { type: Number, required: true, min: 0 },
  discountPercent: { type: Number, default: 0, min: 0, max: 100 },
  lineTotal: { type: Number, required: true },
  lineProfit: { type: Number, default: 0 },
  manufacturingCost: { type: Number, default: 0 },
});

const invoiceSchema = new mongoose.Schema(
  {
    invoiceId: { type: String, required: true, unique: true },
    dealer: { type: mongoose.Schema.Types.ObjectId, ref: 'Dealer', required: true },
    dealerName: { type: String, required: true },
    dealerShop: { type: String, required: true },
    dealerPhone: { type: String, required: true },
    lineItems: [lineItemSchema],
    subtotal: { type: Number, required: true, default: 0 },
    discountTotal: { type: Number, default: 0 },
    gstRate: { type: Number, default: 0, enum: [0, 5, 12, 18] },
    gstAmount: { type: Number, default: 0 },
    totalAmount: { type: Number, required: true, default: 0 },
    totalProfit: { type: Number, default: 0 },
    amountPaid: { type: Number, default: 0 },
    amountDue: { type: Number, default: 0 },
    paymentMode: {
      type: String,
      enum: ['full', 'partial', 'credit'],
      default: 'full',
    },
    paymentStatus: {
      type: String,
      enum: ['paid', 'partial', 'unpaid'],
      default: 'unpaid',
    },
    pdfPath: { type: String, default: '' },
    whatsappSent: { type: Boolean, default: false },
    notes: { type: String, default: '' },
    dueDate: { type: Date },
  },
  { timestamps: true }
);

invoiceSchema.pre('save', function (next) {
  // 🛡 Hardened Business Rule: Always derive Due Amount from Total and Paid
  this.amountDue = parseFloat((this.totalAmount - this.amountPaid).toFixed(2));
  
  if (this.amountDue <= 0.05) { // Precision allowance for floating point
    this.paymentStatus = 'paid';
    if (this.amountDue < 0) this.amountDue = 0; // Prevent negative due
  } else if (this.amountPaid > 0) {
    this.paymentStatus = 'partial';
  } else {
    this.paymentStatus = 'unpaid';
  }
  next();
});

invoiceSchema.index({ dealer: 1 });
invoiceSchema.index({ paymentStatus: 1 });
invoiceSchema.index({ createdAt: -1 });
invoiceSchema.index({ invoiceId: 'text' });

module.exports = mongoose.model('Invoice', invoiceSchema);
