const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema(
  {
    dealerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Dealer', default: null, index: true },
    invoiceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Invoice', default: null, index: true },
    type: {
      type: String,
      enum: ['invoice', 'payment', 'reminder', 'low_stock', 'custom'],
      default: 'custom',
      index: true,
    },
    kind: { type: String, default: '' },
    phone: { type: String, required: true, index: true },
    content: { type: String, required: true },
    toPhone: { type: String, default: '' },
    body: { type: String, default: '' },
    templateKey: { type: String, default: '' },
    relatedInvoiceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Invoice', default: null },
    status: { type: String, enum: ['queued', 'sent', 'failed'], default: 'queued', index: true },
    error: { type: String, default: '' },
    sentAt: { type: Date, default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Message', messageSchema);
