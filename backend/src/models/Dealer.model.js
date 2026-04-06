const mongoose = require('mongoose');

const dealerSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    shopName: { type: String, required: true, trim: true },
    phone: {
      type: String,
      required: true,
      unique: true,
      match: [/^\d{10}$/, 'Phone must be 10 digits'],
    },
    creditLimit: { type: Number, required: true, default: 0, min: 0 },
    pendingAmount: { type: Number, default: 0, min: 0 },
    totalPurchased: { type: Number, default: 0 },
    invoiceCount: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ['active', 'blocked', 'dormant'],
      default: 'active',
    },
    address: { type: String, default: '' },
    gstNumber: { type: String, default: '' },
    notes: { type: String, default: '' },
    lastInvoiceAt: { type: Date },
  },
  { timestamps: true }
);

dealerSchema.virtual('creditUsedPercent').get(function () {
  if (!this.creditLimit || this.creditLimit === 0) return 0;
  return Math.min(100, (this.pendingAmount / this.creditLimit) * 100);
});

dealerSchema.index({ name: 'text', shopName: 'text', phone: 'text' });

module.exports = mongoose.model('Dealer', dealerSchema);
