const InvoiceModel = require('../models/Invoice.model');

async function generateInvoiceId() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const prefix = `INV-${y}${m}${day}-`;

  const last = await InvoiceModel.findOne({ invoiceId: new RegExp(`^${prefix}`) })
    .sort({ invoiceId: -1 })
    .select('invoiceId')
    .lean();

  let seq = 1;
  if (last?.invoiceId) {
    const part = last.invoiceId.split('-').pop();
    const n = parseInt(part, 10);
    if (!Number.isNaN(n)) seq = n + 1;
  }
  const suffix = String(seq).padStart(4, '0');
  return `${prefix}${suffix}`;
}

module.exports = { generateInvoiceId };
