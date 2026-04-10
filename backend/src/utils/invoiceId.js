const { format } = require('date-fns');

/**
 * Generates a human-readable invoice ID
 * Format: INV-YYYYMMDD-XXXXX (5-digit zero-padded sequence per day)
 */
const Invoice = require('../models/Invoice.model');

const generateInvoiceId = async () => {
  const prefix = `INV-`;

  // Find the invoice with the highest sequence number regardless of date
  const last = await Invoice.findOne(
    {},
    { invoiceId: 1 },
    { sort: { createdAt: -1 } }
  );

  let seq = 1;
  if (last) {
    const parts = last.invoiceId.split('-');
    const lastSeq = parseInt(parts[parts.length - 1], 10);
    if (!isNaN(lastSeq)) {
      seq = lastSeq + 1;
    }
  }

  // Return a clean sequential ID
  return `${prefix}${seq}`;
};

module.exports = { generateInvoiceId };
