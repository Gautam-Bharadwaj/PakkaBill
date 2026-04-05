const MessageModel = require('../models/Message.model');
const notification = require('./Notification.service');
const { enqueueWhatsApp } = require('../jobs/whatsapp.job');

function registerHandlers() {
  notification.on('invoice.created', async ({ invoice, dealer }) => {
    const totalAmount = invoice.totalAmount;
    const amountDue = invoice.amountDue;
    const text = `Invoice ${invoice.invoiceId} for ₹${totalAmount.toFixed(2)}. Due: ₹${amountDue.toFixed(2)}`;
    const msg = await MessageModel.create({
      type: 'invoice',
      kind: 'invoice',
      phone: dealer.phone,
      toPhone: dealer.phone,
      content: text,
      body: text,
      dealerId: dealer._id,
      invoiceId: invoice._id,
      relatedInvoiceId: invoice._id,
      templateKey: 'invoice_created',
      status: 'queued',
    });
    await enqueueWhatsApp(msg);
  });

  notification.on('payment.recorded', async ({ invoice, dealer, amount }) => {
    const text = `Payment of ₹${amount.toFixed(2)} recorded for ${invoice.invoiceId}. Due now: ₹${invoice.amountDue.toFixed(2)}`;
    const msg = await MessageModel.create({
      type: 'payment',
      kind: 'payment',
      phone: dealer.phone,
      toPhone: dealer.phone,
      content: text,
      body: text,
      dealerId: dealer._id,
      invoiceId: invoice._id,
      relatedInvoiceId: invoice._id,
      templateKey: 'payment_partial',
      status: 'queued',
    });
    await enqueueWhatsApp(msg);
  });
}

registerHandlers();

module.exports = { registerHandlers };
