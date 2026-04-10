import { Linking } from 'react-native';

export const buildInvoiceMessage = (invoice, pdfUrl) =>
  `*BILL RECEIPT — PAKKABILL*\n` +
  `----------------------------\n` +
  `BILL NO: #${invoice.invoiceId.split('-').pop()}\n` +
  `DATED: ${new Date(invoice.createdAt).toLocaleDateString()}\n` +
  `CUSTOMER: ${invoice.dealerName?.toUpperCase()}\n` +
  `----------------------------\n` +
  `TOTAL AMOUNT: *₹${invoice.totalAmount?.toFixed(2)}*\n` +
  `PENDING DUE: *₹${invoice.amountDue?.toFixed(2)}*\n\n` +
  `📄 *VIEW FULL BILL (PDF):*\n` +
  `${pdfUrl}\n\n` +
  `Thank you for your business!`;

export const buildReminderMessage = (dealer, pendingAmount) =>
  `*PAYMENT REMINDER — PAKKABILL*\n\n` +
  `Dear ${dealer.name?.toUpperCase()},\n` +
  `This is a friendly reminder that a payment of *₹${Number(pendingAmount).toFixed(2)}* is pending at your end.\n\n` +
  `Please clear this at the earliest. Thank you!`;

export const openWhatsApp = async (phone, message) => {
  const url = `whatsapp://send?phone=91${phone}&text=${encodeURIComponent(message)}`;
  const canOpen = await Linking.canOpenURL(url);
  if (canOpen) {
    await Linking.openURL(url);
  } else {
    // Fallback to web
    await Linking.openURL(`https://wa.me/91${phone}?text=${encodeURIComponent(message)}`);
  }
};
