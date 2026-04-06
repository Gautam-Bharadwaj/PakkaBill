const { Router } = require('express');
const { z } = require('zod');
const dealerController = require('../controllers/Dealer.controller');
const validate = require('../middleware/validate.middleware');
const authMiddleware = require('../middleware/auth.middleware');
const invoiceController = require('../controllers/Invoice.controller');
const paymentController = require('../controllers/Payment.controller');

const router = Router();
router.use(authMiddleware);

const dealerSchema = z.object({
  name: z.string().min(1, 'Name required'),
  shopName: z.string().min(1, 'Shop name required'),
  phone: z.string().regex(/^\d{10}$/, 'Phone must be 10 digits'),
  creditLimit: z.number().min(0),
  address: z.string().optional(),
  gstNumber: z.string().optional(),
});

router.get('/', dealerController.list.bind(dealerController));
router.post('/', validate(dealerSchema), dealerController.create.bind(dealerController));
router.get('/:id', dealerController.getById.bind(dealerController));
router.put('/:id', validate(dealerSchema.partial()), dealerController.update.bind(dealerController));
router.delete('/:id', dealerController.delete.bind(dealerController));
router.get('/:id/invoices', invoiceController.getByDealer.bind(invoiceController));
router.get('/:id/payments', paymentController.getByInvoice.bind(paymentController));
router.post('/:id/remind', dealerController.sendReminder.bind(dealerController));

module.exports = router;
