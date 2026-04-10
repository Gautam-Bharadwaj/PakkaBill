const PDFDocument = require('pdfkit');

class PDFService {
  _formatINR(amount) {
    return `${Number(amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
  }

  async generateInvoicePDF(invoice, user) {
    return new Promise((resolve, reject) => {
      // Professional sizing with standard margins
      const doc = new PDFDocument({ margin: 40, size: 'A4' });
      const buffers = [];

      doc.on('data', (chunk) => buffers.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(buffers)));
      doc.on('error', reject);

      // --- COLOR PALETTE ---
      const brandColor = '#FF6B00';
      const charcoal = '#1F2937';
      const softText = '#6B7280';
      const skyBg = '#F3F4F6';

      // --- HEADER: EXECUTIVE STYLE ---
      doc.rect(0, 0, doc.page.width, 120).fill(charcoal); // Dark Header Bar
      doc.rect(0, 115, doc.page.width, 5).fill(brandColor); // Thin Brand Accent Line

      // Logo/Business Name
      doc.fillColor('white').fontSize(26).font('Helvetica-Bold')
        .text(user?.shopName?.toUpperCase() || 'BILLO BUSINESS', 45, 45);
      
      doc.fillColor('white').fontSize(10).font('Helvetica')
        .text(user?.address || 'Premium Wholesale & Distribution', 45, 78, { opacity: 0.8 })
        .text(`Phone: ${user?.phone || '+91 XXX XXX XXXX'}`, 45, 92);

      // Invoice Label
      doc.fillColor(brandColor).fontSize(28).font('Helvetica-Bold')
        .text('INVOICE', 350, 45, { align: 'right', width: 200 });
      
      doc.fillColor('white').fontSize(12).font('Helvetica-Bold')
        .text(`# ${invoice.invoiceId.toUpperCase()}`, 350, 78, { align: 'right', width: 200 });

      // --- BILLING INFO CARDS ---
      doc.moveDown(6);
      const startY = 150;

      // Bill To Card
      doc.rect(40, startY, 250, 85).fill(skyBg);
      doc.fillColor(brandColor).fontSize(10).font('Helvetica-Bold').text('CLIENT DETAILS', 55, startY + 12);
      doc.fillColor(charcoal).fontSize(13).font('Helvetica-Bold').text(invoice.dealerName.toUpperCase(), 55, startY + 28);
      doc.fillColor(softText).fontSize(10).font('Helvetica')
        .text(invoice.dealerShop, 55, startY + 45)
        .text(`Ref: ${invoice.dealerPhone}`, 55, startY + 58);

      // Summary Card (Right)
      doc.rect(320, startY, 235, 85).fill(skyBg);
      doc.fillColor(brandColor).fontSize(10).font('Helvetica-Bold').text('PAYMENT SUMMARY', 335, startY + 12);
      doc.fillColor(charcoal).fontSize(11).font('Helvetica-Bold').text(`DATED: ${new Date(invoice.createdAt).toLocaleDateString('en-IN')}`, 335, startY + 32);
      
      const statusColor = invoice.paymentStatus === 'paid' ? '#10B981' : '#EF4444';
      doc.fillColor(statusColor).fontSize(11).font('Helvetica-Bold').text(`STATUS: ${invoice.paymentStatus.toUpperCase()}`, 335, startY + 52);

      // --- ITEMS GRID ---
      const gridTop = 265;
      doc.rect(40, gridTop, 515, 25).fill(charcoal);
      
      const colX = { name: 55, qty: 320, rate: 380, total: 470 };
      doc.fillColor('white').fontSize(10).font('Helvetica-Bold');
      doc.text('ITEM DESCRIPTION', colX.name, gridTop + 8);
      doc.text('QTY', colX.qty, gridTop + 8, { width: 40, align: 'center' });
      doc.text('RATE', colX.rate, gridTop + 8, { width: 80, align: 'right' });
      doc.text('TOTAL', colX.total, gridTop + 8, { width: 80, align: 'right' });

      let rowY = gridTop + 25;
      doc.font('Helvetica').fontSize(10);
      
      invoice.lineItems.forEach((item, idx) => {
        const rowColor = idx % 2 === 0 ? 'white' : '#FAFAFA';
        doc.rect(40, rowY, 515, 25).fill(rowColor);
        
        doc.fillColor(charcoal).text(item.productName, colX.name, rowY + 8, { width: 250 });
        doc.text(String(item.quantity), colX.qty, rowY + 8, { width: 40, align: 'center' });
        doc.text(this._formatINR(item.unitPrice), colX.rate, rowY + 8, { width: 80, align: 'right' });
        doc.text(this._formatINR(item.lineTotal), colX.total, rowY + 8, { width: 80, align: 'right' });
        
        rowY += 25;
        doc.moveTo(40, rowY).lineTo(555, rowY).strokeColor('#EEEEEE').lineWidth(0.5).stroke();
      });

      // --- FINANCIAL CALCULATION ---
      const calcX = 360;
      rowY += 25;

      const drawCalc = (label, value, font = 'Helvetica', color = softText, size = 10) => {
        doc.fillColor(color).fontSize(size).font(font).text(label, calcX, rowY);
        doc.text(`Rs. ${this._formatINR(value)}`, calcX + 90, rowY, { width: 90, align: 'right' });
        rowY += 18;
      };

      drawCalc('Subtotal', invoice.subtotal);
      if (invoice.gstAmount > 0) drawCalc(`GST (${invoice.gstRate}%)`, invoice.gstAmount);
      if (invoice.discountTotal > 0) drawCalc('Discount Applied', -invoice.discountTotal);

      // Final Total Box
      rowY += 10;
      doc.rect(calcX - 10, rowY - 5, 205, 35).fill(brandColor);
      doc.fillColor('white').fontSize(13).font('Helvetica-Bold').text('NET PAYABLE', calcX, rowY + 8);
      doc.text(`Rs. ${this._formatINR(invoice.totalAmount)}`, calcX + 90, rowY + 8, { width: 90, align: 'right' });

      rowY += 50;

      // --- ACCOUNTING FOOTER ---
      doc.fillColor(charcoal).fontSize(10).font('Helvetica-Bold').text(`Amount Paid: Rs. ${this._formatINR(invoice.amountPaid)}`, 45, rowY);
      doc.fillColor('#EF4444').fontSize(10).font('Helvetica-Bold').text(`Balance Due: Rs. ${this._formatINR(invoice.amountDue)}`, 45, rowY + 16);

      // Bottom Bar
      const footerY = doc.page.height - 80;
      doc.rect(40, footerY, 515, 1).fill(charcoal).opacity(0.1);
      doc.fillColor(charcoal).fontSize(10).font('Helvetica-Bold').text('TERMS & CONDITIONS', 45, footerY + 15);
      doc.fillColor(softText).fontSize(8).font('Helvetica')
        .text('1. Goods once sold will not be exchanged or returned. 2. Payments are due within terms.', 45, footerY + 28);

      doc.fillColor(charcoal).fontSize(10).font('Helvetica-Bold').text('AUTHORIZED SIGNATORY', 380, footerY + 45, { align: 'right', width: 160 });

      doc.end();
    });
  }
}

module.exports = new PDFService();
