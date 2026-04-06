import { Linking } from 'react-native';

export const buildInvoiceMessage = (invoice) =>
  `*Invoice from Billo Billings*\n\n` +
  `Invoice ID: ${invoice.invoiceId}\n` +
  `Total: ₹${invoice.totalAmount?.toFixed(2)}\n` +
  `Due: ₹${invoice.amountDue?.toFixed(2)}\n\n` +
  `Thank you!`;

export const buildReminderMessage = (dealer, pendingAmount) =>
  `*Payment Reminder — Billo Billings*\n\n` +
  `Dear ${dealer.name},\n` +
  `Pending Amount: *₹${Number(pendingAmount).toFixed(2)}*\n\n` +
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
