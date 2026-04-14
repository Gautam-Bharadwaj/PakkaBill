const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    sellingPrice: { type: Number, required: true, min: 0 },
    costBreakdown: {
      paper: { type: Number, default: 0 },
      printing: { type: Number, default: 0 },
      binding: { type: Number, default: 0 },
      other: { type: Number, default: 0 },
    },
    manufacturingCost: { type: Number, default: 0 },
    profitMarginPercent: { type: Number, default: 0 },
    stockQuantity: { type: Number, default: 0, min: 0 },
    lowStockThreshold: { type: Number, default: 10 },
    unitsSold: { type: Number, default: 0 },
    revenue: { type: Number, default: 0 },
    profit: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ['active', 'archived'],
      default: 'active',
    },
    description: { type: String, default: '' },
    sku: { type: String, default: '' },
  },
  { timestamps: true }
);

productSchema.pre('save', function (next) {
  const { paper, printing, binding, other } = this.costBreakdown;
  this.manufacturingCost = paper + printing + binding + (other || 0);
  if (this.sellingPrice > 0) {
    this.profitMarginPercent = parseFloat(
      (((this.sellingPrice - this.manufacturingCost) / this.sellingPrice) * 100).toFixed(2)
    );
  }
  next();
});

productSchema.virtual('isLowStock').get(function () {
  return this.stockQuantity <= this.lowStockThreshold;
});

productSchema.index({ name: 'text' });

module.exports = mongoose.model('Product', productSchema);
