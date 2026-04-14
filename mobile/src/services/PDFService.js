import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { formatINR } from '../utils/currency';
import { formatDate } from '../utils/date';

export const generateInvoicePDF = async (invoice, businessInfo = {}) => {
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0, user-scalable=no" />
        <style>
          body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; padding: 40px; color: #333; }
          .header { display: flex; justify-content: space-between; border-bottom: 2px solid #E5E7EB; padding-bottom: 20px; }
          .business-title { font-size: 24px; font-weight: bold; color: #111; margin-bottom: 4px; }
          .subtitle { font-size: 12px; color: #6B7280; }
          .invoice-box { margin-top: 30px; display: flex; justify-content: space-between; }
          .bill-to { font-size: 14px; }
          .bill-to-title { font-size: 10px; font-weight: bold; color: #9CA3AF; text-transform: uppercase; margin-bottom: 8px; }
          .invoice-meta { text-align: right; }
          .meta-row { display: flex; justify-content: flex-end; margin-bottom: 4px; }
          .meta-label { font-size: 12px; color: #6B7280; width: 100px; }
          .meta-value { font-size: 12px; font-weight: bold; }
          
          table { width: 100%; border-collapse: collapse; margin-top: 40px; }
          thead { background-color: #F9FAFB; }
          th { text-align: left; padding: 12px 8px; font-size: 12px; color: #4B5563; border-bottom: 1px solid #E5E7EB; }
          td { padding: 12px 8px; font-size: 14px; border-bottom: 1px solid #F3F4F6; }
          
          .totals { margin-top: 30px; display: flex; justify-content: flex-end; }
          .totals-table { width: 250px; }
          .total-row { display: flex; justify-content: space-between; padding: 8px 0; }
          .total-label { font-size: 14px; color: #6B7280; }
          .total-value { font-size: 14px; font-weight: bold; }
          .grand-total-row { border-top: 2px solid #111; margin-top: 8px; padding-top: 12px; }
          .grand-total-label { font-size: 16px; font-weight: bold; color: #111; }
          .grand-total-value { font-size: 20px; font-weight: bold; color: #4F46E5; }
          
          .footer { margin-top: 60px; text-align: center; border-top: 1px solid #E5E7EB; padding-top: 20px; }
          .thanks { font-size: 16px; font-weight: bold; color: #111; }
          .footer-sub { font-size: 12px; color: #6B7280; margin-top: 4px; }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <div class="business-title">${businessInfo.name || 'PAKKABILL CORP'}</div>
            <div class="subtitle">${businessInfo.address || 'Hauz Khas, New Delhi - 110016'}</div>
            <div class="subtitle">GSTIN: ${businessInfo.gstin || '07AAAAA0000A1Z5'}</div>
            <div class="subtitle">Phone: ${businessInfo.phone || '+91 98765 43210'}</div>
          </div>
          <div style="text-align: right;">
            <div style="font-size: 32px; font-weight: bold; color: #E5E7EB;">TAX INVOICE</div>
          </div>
        </div>

        <div class="invoice-box">
          <div class="bill-to">
            <div class="bill-to-title">Bill To</div>
            <div style="font-size: 16px; font-weight: bold;">${invoice.dealerName || 'Walk-in Customer'}</div>
            <div class="subtitle">${invoice.dealerShop || ''}</div>
            <div class="subtitle">Phone: ${invoice.dealerPhone || ''}</div>
          </div>
          <div class="invoice-meta">
            <div class="meta-row">
              <span class="meta-label">Invoice No:</span>
              <span class="meta-value">#${invoice.invoiceId.split('-').pop()}</span>
            </div>
            <div class="meta-row">
              <span class="meta-label">Date:</span>
              <span class="meta-value">${formatDate(invoice.createdAt, 'dd MMM yyyy')}</span>
            </div>
            <div class="meta-row">
              <span class="meta-label">Status:</span>
              <span class="meta-value" style="color: ${invoice.paymentStatus === 'paid' ? '#059669' : '#DC2626'}">${invoice.paymentStatus.toUpperCase()}</span>
            </div>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th style="width: 50%;">Description</th>
              <th style="text-align: center;">Qty</th>
              <th style="text-align: right;">Rate</th>
              <th style="text-align: right;">Amount</th>
            </tr>
          </thead>
          <tbody>
            ${invoice.lineItems.map(item => `
              <tr>
                <td>${item.productName}</td>
                <td style="text-align: center;">${item.quantity}</td>
                <td style="text-align: right;">${formatINR(item.price)}</td>
                <td style="text-align: right; font-weight: bold;">${formatINR(item.lineTotal)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <div class="totals">
          <div class="totals-table">
            <div class="total-row">
              <span class="total-label">Subtotal</span>
              <span class="total-value">${formatINR(invoice.subtotal)}</span>
            </div>
            ${invoice.gstAmount > 0 ? `
              <div class="total-row">
                <span class="total-label">CGST (9%)</span>
                <span class="total-value">${formatINR(invoice.gstAmount / 2)}</span>
              </div>
              <div class="total-row">
                <span class="total-label">SGST (9%)</span>
                <span class="total-value">${formatINR(invoice.gstAmount / 2)}</span>
              </div>
            ` : ''}
            <div class="total-row grand-total-row">
              <span class="grand-total-label">Total</span>
              <span class="grand-total-value">${formatINR(invoice.totalAmount)}</span>
            </div>
          </div>
        </div>

        <div class="footer">
          <div class="thanks">Thank you for your business!</div>
          <div class="footer-sub">This is a computer generated invoice and does not require a physical signature.</div>
          <div class="footer-sub" style="margin-top: 10px; font-weight: bold;">Generatred via PakkaBill</div>
        </div>
      </body>
    </html>
  `;

  try {
    const { uri } = await Print.printToFileAsync({ html, base64: false });
    console.log('[PDF] Generated at:', uri);
    return uri;
  } catch (error) {
    console.error('[PDF] Generation Error:', error);
    throw error;
  }
};

export const shareInvoicePDF = async (invoice, businessInfo) => {
    try {
        const uri = await generateInvoicePDF(invoice, businessInfo);
        if (await Sharing.isAvailableAsync()) {
            await Sharing.shareAsync(uri, {
                mimeType: 'application/pdf',
                dialogTitle: `Share Invoice #${invoice.invoiceId.split('-').pop()}`,
                UTI: 'com.adobe.pdf',
            });
        }
    } catch (error) {
        console.error('[PDF] Share Error:', error);
    }
};
