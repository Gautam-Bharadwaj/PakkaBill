const MessageModel = require('../models/Message.model');
const InvoiceModel = require('../models/Invoice.model');
const { enqueueWhatsApp } = require('./whatsapp.job');

/**
 * Cron-style overdue reminders — placeholder schedule (wire node-cron in production).
 */
async function queueOverdueReminders() {
  const daysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const overdue = await InvoiceModel.find({
    paymentStatus: { $in: ['unpaid', 'partial'] },
    amountDue: { $gt: 0 },
    createdAt: { $lt: daysAgo },
  })
    .limit(50)
    .lean();

  for (const inv of overdue) {
    const phone = inv.dealerSnapshot?.phone;
    if (!phone) continue;
    const msg = await MessageModel.create({
      type: 'reminder',
      kind: 'reminder',
      phone,
      toPhone: phone,
      content: `Reminder: ₹${inv.amountDue.toFixed(2)} due on ${inv.invoiceId}`,
      body: `Reminder: ₹${inv.amountDue.toFixed(2)} due on ${inv.invoiceId}`,
      dealerId: inv.dealerId,
      invoiceId: inv._id,
      relatedInvoiceId: inv._id,
      status: 'queued',
    });
    await enqueueWhatsApp(msg);
  }
}

function scheduleReminders(intervalMs = 86_400_000) {
  return setInterval(() => {
    queueOverdueReminders().catch((e) => console.error('reminder.job', e));
  }, intervalMs);
}

module.exports = { queueOverdueReminders, scheduleReminders };
