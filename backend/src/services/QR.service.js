const QRCode = require('qrcode');
const { buildUpiPayUri } = require('../utils/upiLink');

class QRService {
  buildUpiUri(params) {
    return buildUpiPayUri(params);
  }

  /**
   * Generates a QR buffer for an invoice using environment variables for UPI details.
   */
  async generateInvoiceQr(invoice) {
    const pa = process.env.UPI_VPA;
    const pn = process.env.UPI_PAYEE_NAME || process.env.BUSINESS_NAME || 'Merchant';
    if (!pa) throw new Error('UPI_VPA not configured');

    const amount = invoice.amountDue > 0 ? invoice.amountDue.toFixed(2) : '0';
    return this.upiQrPngBuffer({
      pa,
      pn,
      am: amount,
      tn: invoice.invoiceId,
    });
  }

  async upiQrPngBuffer({ pa, pn, am, tn }) {
    const uri = buildUpiPayUri({ pa, pn, am, tn });
    return QRCode.toBuffer(uri, { type: 'png', width: 256, margin: 2 });
  }
}

module.exports = new QRService();
