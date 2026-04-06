const paymentService = require('../services/Payment.service');
const qrService = require('../services/QR.service');
const invoiceService = require('../services/Invoice.service');
const ApiResponse = require('../utils/ApiResponse');

class PaymentController {
  async record(req, res, next) {
    try {
      const payment = await paymentService.recordPayment({
        ...req.body,
        userId: req.user._id,
      });
      ApiResponse.created(res, payment, 'Payment recorded');
    } catch (err) { next(err); }
  }

  async getByInvoice(req, res, next) {
    try {
      const payments = await paymentService.getPaymentsByInvoice(req.params.invoiceId);
      ApiResponse.success(res, payments, 'Payments fetched');
    } catch (err) { next(err); }
  }

  async getQR(req, res, next) {
    try {
      const qrData = await paymentService.generateQrData(req.params.invoiceId);
      const { qrDataUrl } = await qrService.generateUpiQR(
        await invoiceService.getById(req.params.invoiceId)
      );
      ApiResponse.success(res, { ...qrData, qrDataUrl }, 'QR generated');
    } catch (err) { next(err); }
  }
}

module.exports = new PaymentController();
