const fs = require('fs');
const invoiceService = require('../services/Invoice.service');
const qrService = require('../services/QR.service');
const { asyncHandler } = require('../utils/asyncHandler');

exports.preview = asyncHandler(async (req, res) => {
  const result = await invoiceService.previewInvoice(req.body);
  res.json({ preview: result });
});

exports.create = asyncHandler(async (req, res) => {
  const invoice = await invoiceService.createInvoice(req.body);
  res.status(201).json({ invoice });
});

exports.list = asyncHandler(async (req, res) => {
  const invoices = await invoiceService.listInvoices(req.query);
  res.json({ invoices });
});

exports.getOne = asyncHandler(async (req, res) => {
  const invoice = await invoiceService.getInvoice(req.params.id);
  if (!invoice) {
    return res.status(404).json({ success: false, error: 'Invoice not found' });
  }
  return res.json({ invoice });
});

exports.downloadPdf = asyncHandler(async (req, res) => {
  const invoice = await invoiceService.getInvoice(req.params.id);
  if (!invoice) return res.status(404).json({ success: false, error: 'Invoice not found' });
  if (!invoice.pdfPath || !fs.existsSync(invoice.pdfPath)) {
    return res.status(404).json({ success: false, error: 'PDF not available' });
  }
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="${invoice.invoiceId}.pdf"`);
  fs.createReadStream(invoice.pdfPath).pipe(res);
});

exports.upiQrLegacy = asyncHandler(async (req, res) => {
  const invoice = await invoiceService.getInvoice(req.params.id);
  if (!invoice) return res.status(404).json({ success: false, error: 'Invoice not found' });
  
  try {
    const buf = await qrService.generateInvoiceQr(invoice);
    res.setHeader('Content-Type', 'image/png');
    res.send(buf);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

exports.sendWhatsApp = asyncHandler(async (req, res) => {
  const result = await invoiceService.sendWhatsAppResend(req.params.id);
  res.json(result);
});
