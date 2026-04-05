const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    sellingPrice: { type: Number, required: true, min: 0 },
    costBreakdown: {
      paper: { type: Number, default: 0, min: 0 },
      printing: { type: Number, default: 0, min: 0 },
      binding: { type: Number, default: 0, min: 0 },
    },
    manufacturingCost: { type: Number, required: true, min: 0 },
    stockQuantity: { type: Number, required: true, min: 0, default: 0 },
    lowStockThreshold: { type: Number, required: true, min: 0, default: 10 },
    isArchived: { type: Boolean, default: false, index: true },
  },
  { timestamps: true }
);

productSchema.index({ name: 'text' });

module.exports = mongoose.model('Product', productSchema);
