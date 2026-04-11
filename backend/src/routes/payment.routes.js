const { Router } = require('express');
const { z } = require('zod');
const paymentController = require('../controllers/Payment.controller');
const validate = require('../middleware/validate.middleware');
const authMiddleware = require('../middleware/auth.middleware');

const router = Router();
router.use(authMiddleware);

const paymentSchema = z.object({
  invoiceId: z.string().min(1),
  amount: z.number().positive(),
  mode: z.enum(['cash', 'upi', 'bank', 'other']),
  upiReference: z.string().optional(),
  note: z.string().optional(),
});

router.post('/', validate(paymentSchema), paymentController.record.bind(paymentController));
router.get('/:invoiceId', paymentController.getByInvoice.bind(paymentController));
router.get('/:invoiceId/qr', paymentController.getQR.bind(paymentController));
router.delete('/:id', paymentController.delete.bind(paymentController));

module.exports = router;
