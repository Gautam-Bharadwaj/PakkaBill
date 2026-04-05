const MessageTemplate = require('../models/MessageTemplate.model');
const { asyncHandler } = require('../utils/asyncHandler');

const defaults = [
  {
    key: 'invoice_created',
    label: 'Invoice created',
    body: 'Hi {{dealerName}}, invoice {{invoiceId}} for ₹{{total}}. Due: ₹{{due}}.',
  },
  {
    key: 'payment_partial',
    label: 'Payment recorded',
    body: 'Payment ₹{{amount}} for {{invoiceId}}. Outstanding: ₹{{due}}.',
  },
  {
    key: 'reminder_overdue',
    label: 'Payment reminder',
    body: 'Reminder: ₹{{due}} pending for {{invoiceId}}.',
  },
];

exports.list = asyncHandler(async (req, res) => {
  let items = await MessageTemplate.find().sort({ key: 1 }).lean();
  if (items.length === 0) {
    await MessageTemplate.insertMany(defaults);
    items = await MessageTemplate.find().sort({ key: 1 }).lean();
  }
  res.json({ templates: items });
});

exports.upsert = asyncHandler(async (req, res) => {
  const template = await MessageTemplate.findOneAndUpdate({ key: req.body.key }, req.body, {
    upsert: true,
    new: true,
    setDefaultsOnInsert: true,
  });
  res.json({ template });
});
