const Joi = require('joi');

const phone = Joi.string().pattern(/^[6-9]\d{9}$/).required();

exports.register = Joi.object({
  phone,
  pin: Joi.string().min(4).max(6).required(),
});

exports.login = Joi.object({
  phone,
  pin: Joi.string().required(),
});

exports.refresh = Joi.object({
  refreshToken: Joi.string().required(),
});

exports.dealerCreate = Joi.object({
  name: Joi.string().min(1).max(200).required(),
  phone: Joi.string().min(10).max(15).required(),
  shopName: Joi.string().allow('').max(200),
  creditLimit: Joi.number().min(0).required(),
});

exports.dealerUpdate = Joi.object({
  name: Joi.string().min(1).max(200),
  phone: Joi.string().min(10).max(15),
  shopName: Joi.string().allow('').max(200),
  creditLimit: Joi.number().min(0),
}).min(1);

exports.productCreate = Joi.object({
  name: Joi.string().min(1).max(200).required(),
  sellingPrice: Joi.number().min(0).required(),
  costBreakdown: Joi.object({
    paper: Joi.number().min(0),
    printing: Joi.number().min(0),
    binding: Joi.number().min(0),
  }),
  stockQuantity: Joi.number().min(0),
  lowStockThreshold: Joi.number().min(0),
});

exports.productUpdate = Joi.object({
  name: Joi.string().min(1).max(200),
  sellingPrice: Joi.number().min(0),
  costBreakdown: Joi.object({
    paper: Joi.number().min(0),
    printing: Joi.number().min(0),
    binding: Joi.number().min(0),
  }),
  stockQuantity: Joi.number().min(0),
  lowStockThreshold: Joi.number().min(0),
  archived: Joi.boolean(),
}).min(1);

const invoiceItem = Joi.object({
  productId: Joi.string().hex().length(24).required(),
  quantity: Joi.number().integer().min(1).required(),
  unitPrice: Joi.number().min(0).optional(),
  discount: Joi.number().min(0).default(0),
});

exports.invoicePreview = Joi.object({
  dealerId: Joi.string().hex().length(24).required(),
  items: Joi.array().items(invoiceItem).min(1).required(),
  gstRate: Joi.number().valid(0, 5, 12, 18).default(0),
});

exports.invoiceCreate = Joi.object({
  dealerId: Joi.string().hex().length(24).required(),
  items: Joi.array().items(invoiceItem).min(1).required(),
  gstRate: Joi.number().valid(0, 5, 12, 18).default(0),
  paymentMode: Joi.string().valid('full', 'partial', 'credit').required(),
  amountPaid: Joi.when('paymentMode', {
    is: 'partial',
    then: Joi.number().min(0.01).required(),
    otherwise: Joi.number().min(0).default(0),
  }),
});

exports.paymentCreate = Joi.object({
  invoiceId: Joi.string().hex().length(24).required(),
  amount: Joi.number().min(0.01).required(),
  mode: Joi.string().valid('cash', 'upi', 'bank').required(),
  upiRef: Joi.string().allow(''),
  note: Joi.string().allow(''),
});

exports.templateUpsert = Joi.object({
  key: Joi.string().required(),
  label: Joi.string().required(),
  body: Joi.string().required(),
});

exports.dealerListQuery = Joi.object({
  q: Joi.string().allow(''),
  minPending: Joi.number(),
  maxPending: Joi.number(),
});

exports.invoiceListQuery = Joi.object({
  dealerId: Joi.string().hex().length(24),
  from: Joi.date().iso(),
  to: Joi.date().iso(),
  paymentStatus: Joi.string().valid('unpaid', 'partial', 'paid'),
});
