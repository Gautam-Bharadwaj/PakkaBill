const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema(
  {
    to: { type: String, required: true },
    type: {
      type: String,
      enum: ['invoice', 'reminder', 'payment_receipt', 'otp'],
      required: true,
    },
    invoice: { type: mongoose.Schema.Types.ObjectId, ref: 'Invoice' },
    dealer: { type: mongoose.Schema.Types.ObjectId, ref: 'Dealer' },
    body: { type: String, required: true },
    status: {
      type: String,
      enum: ['pending', 'sent', 'failed'],
      default: 'pending',
    },
    error: { type: String, default: '' },
    sentAt: { type: Date },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Message', messageSchema);
