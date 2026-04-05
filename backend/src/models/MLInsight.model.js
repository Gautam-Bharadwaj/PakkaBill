const mongoose = require('mongoose');

const mlInsightSchema = new mongoose.Schema(
  {
    kind: { type: String, required: true, index: true },
    payload: { type: mongoose.Schema.Types.Mixed, required: true },
    computedAt: { type: Date, default: Date.now, index: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('MLInsight', mlInsightSchema);
