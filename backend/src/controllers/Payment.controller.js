const paymentService = require('../services/Payment.service');
const invoiceService = require('../services/Invoice.service');
const qrService = require('../services/QR.service');
const { PaymentRepository } = require('../repositories/Payment.repository');
const { asyncHandler } = require('../utils/asyncHandler');

const paymentRepository = new PaymentRepository();

exports.create = asyncHandler(async (req, res) => {
  const result = await paymentService.recordPayment(req.body);
  res.status(201).json(result);
});

exports.listAll = asyncHandler(async (req, res) => {
  const payments = await paymentService.listAll(500);
  res.json({ payments });
});

exports.listByInvoice = asyncHandler(async (req, res) => {
  const payments = await paymentRepository.findByInvoice(req.params.id);
  res.json({ payments });
});

exports.qrForInvoice = asyncHandler(async (req, res) => {
  const invoice = await invoiceService.getInvoice(req.params.invoiceId);
  if (!invoice) return res.status(404).json({ success: false, error: 'Invoice not found' });
  
  try {
    const buf = await qrService.generateInvoiceQr(invoice);
    res.setHeader('Content-Type', 'image/png');
    res.send(buf);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});
