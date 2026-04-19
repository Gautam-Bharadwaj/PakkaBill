import { Linking } from 'react-native';

export const buildInvoiceMessage = (invoice, pdfUrl) => {
  const invId = invoice?.invoiceId ? invoice.invoiceId.split('-').pop() : 'N/A';
  const dealer = (invoice?.dealerName || invoice?.dealer?.name || 'Customer').toUpperCase();
  const total = Number(invoice?.totalAmount || 0).toFixed(2);
  const due = Number(invoice?.amountDue || 0).toFixed(2);

  return `*BILL RECEIPT — PAKKABILL*\n` +
  `----------------------------\n` +
  `BILL NO: #${invId}\n` +
  `DATED: ${new Date(invoice?.createdAt || Date.now()).toLocaleDateString()}\n` +
  `CUSTOMER: ${dealer}\n` +
  `----------------------------\n` +
  `TOTAL AMOUNT: *₹${total}*\n` +
  `PENDING DUE: *₹${due}*\n\n` +
  (pdfUrl ? `📄 *VIEW FULL BILL (PDF):*\n${pdfUrl}\n\n` : '') +
  `Thank you for your business!`;
};

export const buildReminderMessage = (dealer, pendingAmount) =>
  `*PAYMENT REMINDER — PAKKABILL*\n\n` +
  `Dear ${dealer.name?.toUpperCase()},\n` +
  `This is a friendly reminder that a payment of *₹${Number(pendingAmount).toFixed(2)}* is pending at your end.\n\n` +
  `Please clear this at the earliest. Thank you!`;

export const openWhatsApp = async (phone, message) => {
  // Strip any non-numeric characters and handle existing country code
  let cleanPhone = String(phone).replace(/[^0-9]/g, '');
  if (cleanPhone.length === 12 && cleanPhone.startsWith('91')) {
    // Already has 91
  } else if (cleanPhone.length === 10) {
    cleanPhone = `91${cleanPhone}`;
  }

  const url = `whatsapp://send?phone=${cleanPhone}&text=${encodeURIComponent(message)}`;
  const canOpen = await Linking.canOpenURL(url);
  if (canOpen) {
    await Linking.openURL(url);
  } else {
    // Fallback to web link
    await Linking.openURL(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`);
  }
};
