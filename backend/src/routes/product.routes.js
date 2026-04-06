const { Router } = require('express');
const { z } = require('zod');
const productController = require('../controllers/Product.controller');
const validate = require('../middleware/validate.middleware');
const authMiddleware = require('../middleware/auth.middleware');

const router = Router();
router.use(authMiddleware);

const costSchema = z.object({
  paper: z.number().min(0).default(0),
  printing: z.number().min(0).default(0),
  binding: z.number().min(0).default(0),
  other: z.number().min(0).default(0),
}).optional();

const productSchema = z.object({
  name: z.string().min(1),
  sellingPrice: z.number().min(0),
  costBreakdown: costSchema,
  stockQuantity: z.number().min(0).default(0),
  lowStockThreshold: z.number().min(0).default(10),
  description: z.string().optional(),
  sku: z.string().optional(),
});

router.get('/', productController.list.bind(productController));
router.post('/', validate(productSchema), productController.create.bind(productController));
router.get('/:id', productController.getById.bind(productController));
router.put('/:id', validate(productSchema.partial()), productController.update.bind(productController));
router.delete('/:id', productController.delete.bind(productController));

module.exports = router;
