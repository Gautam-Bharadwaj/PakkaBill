const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema(
  {
    invoiceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Invoice', required: true, index: true },
    dealerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Dealer', required: true, index: true },
    amount: { type: Number, required: true, min: 0.01 },
    mode: { type: String, enum: ['cash', 'upi', 'bank'], required: true },
    upiRef: { type: String, default: '' },
    note: { type: String, default: '' },
    recordedAt: { type: Date, default: Date.now, index: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Payment', paymentSchema);
