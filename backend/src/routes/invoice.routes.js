const { Router } = require('express');
const { z } = require('zod');
const invoiceController = require('../controllers/Invoice.controller');
const validate = require('../middleware/validate.middleware');
const authMiddleware = require('../middleware/auth.middleware');

const router = Router();
router.use(authMiddleware);

const lineItemSchema = z.object({
  productId: z.string().min(1),
  quantity: z.number().min(1),
  unitPrice: z.number().min(0).optional(),
  discountPercent: z.number().min(0).max(100).default(0),
});

const invoiceSchema = z.object({
  dealerId: z.string().min(1, 'Dealer required'),
  lineItems: z.array(lineItemSchema).min(1, 'At least one item required'),
  gstRate: z.number().refine((v) => [0, 5, 12, 18].includes(v)).default(0),
  paymentMode: z.enum(['full', 'partial', 'credit']).default('credit'),
  amountPaid: z.number().min(0).default(0),
  notes: z.string().optional(),
});

router.get('/', invoiceController.list.bind(invoiceController));
router.post('/', validate(invoiceSchema), invoiceController.create.bind(invoiceController));
router.get('/:id', invoiceController.getById.bind(invoiceController));
router.get('/:id/pdf', invoiceController.downloadPDF.bind(invoiceController));
router.post('/:id/send-whatsapp', invoiceController.sendWhatsApp.bind(invoiceController));

module.exports = router;
