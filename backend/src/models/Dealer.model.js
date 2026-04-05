const mongoose = require('mongoose');

const dealerSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    phone: { type: String, required: true, index: true },
    shopName: { type: String, default: '', trim: true },
    creditLimit: { type: Number, required: true, min: 0, default: 0 },
    pendingAmount: { type: Number, required: true, min: 0, default: 0 },
    totalPurchased: { type: Number, required: true, min: 0, default: 0 },
  },
  { timestamps: true }
);

dealerSchema.index({ name: 'text', phone: 'text', shopName: 'text' });

module.exports = mongoose.model('Dealer', dealerSchema);
