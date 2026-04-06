const { format } = require('date-fns');

/**
 * Generates a human-readable invoice ID
 * Format: INV-YYYYMMDD-XXXXX (5-digit zero-padded sequence per day)
 */
const Invoice = require('../models/Invoice.model');

const generateInvoiceId = async () => {
  const today = format(new Date(), 'yyyyMMdd');
  const prefix = `INV-${today}-`;

  const last = await Invoice.findOne(
    { invoiceId: { $regex: `^${prefix}` } },
    { invoiceId: 1 },
    { sort: { createdAt: -1 } }
  );

  let seq = 1;
  if (last) {
    const parts = last.invoiceId.split('-');
    seq = parseInt(parts[parts.length - 1], 10) + 1;
  }

  return `${prefix}${String(seq).padStart(5, '0')}`;
};

module.exports = { generateInvoiceId };
