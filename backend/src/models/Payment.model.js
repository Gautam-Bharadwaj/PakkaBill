const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema(
  {
    invoice: { type: mongoose.Schema.Types.ObjectId, ref: 'Invoice', required: true },
    dealer: { type: mongoose.Schema.Types.ObjectId, ref: 'Dealer', required: true },
    amount: { type: Number, required: true, min: 0 },
    mode: {
      type: String,
      enum: ['cash', 'upi', 'bank', 'other'],
      required: true,
    },
    upiReference: { type: String, default: '' },
    note: { type: String, default: '' },
    recordedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

paymentSchema.index({ invoice: 1 });
paymentSchema.index({ dealer: 1 });
paymentSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Payment', paymentSchema);
