const invoiceService = require('../services/Invoice.service');
const pdfService = require('../services/PDF.service');
const whatsappService = require('../services/WhatsApp.service');
const ApiResponse = require('../utils/ApiResponse');

class InvoiceController {
  async list(req, res, next) {
    try {
      const { q = '', status = 'all', page = 1, limit = 20 } = req.query;
      const result = await invoiceService.list(q, status, Number(page), Number(limit));
      ApiResponse.success(res, result.data, 'Invoices fetched', 200, result.pagination);
    } catch (err) { next(err); }
  }

  async getById(req, res, next) {
    try {
      const invoice = await invoiceService.getById(req.params.id);
      ApiResponse.success(res, invoice, 'Invoice fetched');
    } catch (err) { next(err); }
  }

  async create(req, res, next) {
    try {
      const invoice = await invoiceService.create(req.body);
      ApiResponse.created(res, invoice, 'Invoice created');
    } catch (err) { next(err); }
  }

  async update(req, res, next) {
    try {
      const invoice = await invoiceService.updateInvoice(req.params.id, req.body);
      ApiResponse.success(res, invoice, 'Invoice updated');
    } catch (err) { next(err); }
  }

  async downloadPDF(req, res, next) {
    try {
      const invoice = await invoiceService.getById(req.params.id);
      const pdfBuffer = await pdfService.generateInvoicePDF(invoice, req.user);
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${invoice.invoiceId}.pdf"`);
      res.send(pdfBuffer);
    } catch (err) { next(err); }
  }

  async sendWhatsApp(req, res, next) {
    try {
      const invoice = await invoiceService.getById(req.params.id);
      const message = whatsappService.buildInvoiceMessage(invoice);
      const link = whatsappService.getWhatsAppLink(invoice.dealerPhone, message);

      if (whatsappService.ready) {
        // 1. Generate the PDF on the fly
        const pdfBuffer = await pdfService.generateInvoicePDF(invoice, req.user);
        
        // 2. Prepare base64 payload for WhatsApp Document
        const mediaData = {
          mimetype: 'application/pdf',
          base64: pdfBuffer.toString('base64'),
          filename: `Invoice_${invoice.invoiceId}.pdf`
        };

        // 3. Send message with attached PDF!
        await whatsappService.sendMessage(invoice.dealerPhone, message, 'invoice', invoice._id, invoice.dealer, mediaData);
      }

      ApiResponse.success(res, { link }, 'WhatsApp message queued');
    } catch (err) { next(err); }
  }

  async getByDealer(req, res, next) {
    try {
      const { page = 1, limit = 20 } = req.query;
      const result = await invoiceService.getByDealer(req.params.dealerId, Number(page), Number(limit));
      ApiResponse.success(res, result.data, 'Dealer invoices fetched', 200, result.pagination);
    } catch (err) { next(err); }
  }
}

module.exports = new InvoiceController();
