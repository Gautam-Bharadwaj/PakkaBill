const QRCode = require('qrcode');
const { generateUpiLink } = require('../utils/upiLink');
const env = require('../config/env');

class QRService {
  async generateUpiQR(invoice) {
    const upiLink = generateUpiLink({
      vpa: env.UPI_VPA,
      name: env.UPI_NAME,
      amount: invoice.amountDue,
      note: invoice.invoiceId,
    });

    const qrDataUrl = await QRCode.toDataURL(upiLink, {
      width: 300,
      margin: 2,
      color: { dark: '#1A237E', light: '#FFFFFF' },
    });

    return { qrDataUrl, upiLink };
  }

  async generateQrBuffer(data) {
    return QRCode.toBuffer(data, { width: 300 });
  }
}

module.exports = new QRService();
