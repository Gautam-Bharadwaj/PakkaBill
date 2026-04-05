const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');
const { buildUpiPayUri } = require('../utils/upiLink');

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

class PDFService {
  async generateInvoicePdf({ invoice, businessName, businessAddress, gstin, upi, payeeName }) {
    const dir = process.env.PDF_STORAGE_DIR || path.join(process.cwd(), 'storage', 'pdfs');
    ensureDir(dir);
    const filename = `${invoice.invoiceId.replace(/[^a-zA-Z0-9-_]/g, '_')}.pdf`;
    const outPath = path.join(dir, filename);

    const doc = new PDFDocument({ margin: 50, size: 'A4' });
    const stream = fs.createWriteStream(outPath);
    doc.pipe(stream);

    doc.fontSize(18).text(businessName || 'Notebook Wholesale', { align: 'center' });
    doc.moveDown(0.3);
    doc.fontSize(10).text(businessAddress || '', { align: 'center' });
    if (gstin) doc.fontSize(9).text(`GSTIN: ${gstin}`, { align: 'center' });
    doc.moveDown();

    doc.fontSize(12).text(`Invoice: ${invoice.invoiceId}`, { continued: false });
    doc.fontSize(10).text(`Date: ${new Date(invoice.createdAt).toLocaleString('en-IN')}`);
    doc.moveDown();

    doc.fontSize(11).text('Bill To', { underline: true });
    doc.fontSize(10);
    doc.text(invoice.dealerSnapshot?.name || '');
    doc.text(invoice.dealerSnapshot?.shopName || '');
    doc.text(`Phone: ${invoice.dealerSnapshot?.phone || ''}`);
    doc.moveDown();

    const tableTop = doc.y;
    doc.fontSize(10).text('Item', 50, tableTop, { width: 200 });
    doc.text('Qty', 260, tableTop, { width: 40 });
    doc.text('Rate', 310, tableTop, { width: 60 });
    doc.text('Disc', 380, tableTop, { width: 50 });
    doc.text('Amount', 440, tableTop, { width: 100, align: 'right' });
    doc.moveTo(50, doc.y + 5).lineTo(540, doc.y + 5).stroke();

    let y = doc.y + 10;
    for (const line of invoice.items || []) {
      const ext = line.lineTotal != null ? line.lineTotal : line.quantity * line.unitPrice - line.discount;
      doc.text(line.productSnapshot?.name || 'Product', 50, y, { width: 200 });
      doc.text(String(line.quantity), 260, y, { width: 40 });
      doc.text(String(line.unitPrice), 310, y, { width: 60 });
      doc.text(String(line.discount), 380, y, { width: 50 });
      doc.text(ext.toFixed(2), 440, y, { width: 100, align: 'right' });
      y += 18;
    }

    doc.y = y + 10;
    doc.moveDown();
    doc.fontSize(10);
    doc.text(`Subtotal: ₹${invoice.subtotal.toFixed(2)}`, { align: 'right' });
    if (invoice.discountTotal) doc.text(`Discount: ₹${invoice.discountTotal.toFixed(2)}`, { align: 'right' });
    if (invoice.gstRate) {
      doc.text(`GST (${invoice.gstRate}%): ₹${invoice.gstAmount.toFixed(2)}`, { align: 'right' });
    }
    doc.fontSize(12).text(`Total: ₹${invoice.totalAmount.toFixed(2)}`, { align: 'right' });
    doc.fontSize(10).text(`Profit (internal): ₹${invoice.totalProfit.toFixed(2)}`, { align: 'right' });
    doc.text(`Paid: ₹${invoice.amountPaid.toFixed(2)} | Due: ₹${invoice.amountDue.toFixed(2)}`, {
      align: 'right',
    });
    doc.text(`Status: ${invoice.paymentStatus}`, { align: 'right' });
    doc.moveDown();

    if (upi && invoice.amountDue > 0) {
      const uri = buildUpiPayUri({
        pa: upi,
        pn: payeeName || businessName,
        am: invoice.amountDue.toFixed(2),
        tn: invoice.invoiceId,
      });
      doc.fontSize(9).text('Pay via UPI (scan in any UPI app):', { align: 'left' });
      doc.fontSize(8).text(uri, { align: 'left', link: uri });
    }

    doc.end();

    await new Promise((resolve, reject) => {
      stream.on('finish', resolve);
      stream.on('error', reject);
    });

    return outPath;
  }
}

module.exports = new PDFService();
