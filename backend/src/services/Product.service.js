const { ApiError } = require('../utils/ApiError');
const { ProductRepository } = require('../repositories/Product.repository');

const productRepo = new ProductRepository();

function computeManufacturingCost(costBreakdown) {
  const c = costBreakdown || {};
  return (c.paper || 0) + (c.printing || 0) + (c.binding || 0);
}

function marginPct(sellingPrice, manufacturingCost) {
  if (!sellingPrice) return 0;
  return ((sellingPrice - manufacturingCost) / sellingPrice) * 100;
}

function enrich(product) {
  if (!product) return null;
  const p = product.toObject ? product.toObject() : product;
  return {
    ...p,
    profitMarginPercent: marginPct(p.sellingPrice, p.manufacturingCost),
    lowStock: p.stockQuantity <= p.lowStockThreshold,
  };
}

class ProductService {
  async list({ archived } = {}) {
    const filter = ProductRepository.notArchivedFilter();
    if (archived === 'true') {
      const products = await productRepo.model.find({ isArchived: true }).sort({ name: 1 }).lean();
      return products.map(enrich);
    }
    const products = await productRepo.findAvailable().sort({ name: 1 }).lean();
    return products.map(enrich);
  }

  async getById(id) {
    const p = await productRepo.findById(id).lean();
    if (!p) throw ApiError.notFound('Product not found');
    return enrich(p);
  }

  async create(body) {
    const costBreakdown = body.costBreakdown || {};
    const manufacturingCost = computeManufacturingCost(costBreakdown);
    const product = await productRepo.create({
      ...body,
      costBreakdown,
      manufacturingCost,
      isArchived: false,
    });
    return product;
  }

  async update(id, body) {
    const existing = await productRepo.findById(id);
    if (!existing) throw ApiError.notFound('Product not found');
    const costBreakdown = {
      ...(existing.costBreakdown?.toObject ? existing.costBreakdown.toObject() : existing.costBreakdown),
      ...(body.costBreakdown || {}),
    };
    const manufacturingCost = computeManufacturingCost(costBreakdown);
    const product = await productRepo.updateById(
      id,
      {
        ...body,
        costBreakdown,
        manufacturingCost,
      },
      { new: true, runValidators: true }
    );
    return product;
  }

  async archive(id) {
    const product = await productRepo.updateById(id, { isArchived: true }, { new: true });
    if (!product) throw ApiError.notFound('Product not found');
    return product;
  }
}

module.exports = new ProductService();
