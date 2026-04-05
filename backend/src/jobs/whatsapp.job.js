const Queue = require('bull');
const MessageModel = require('../models/Message.model');

let queue = null;

function getQueue() {
  if (queue) return queue;
  const redisUrl = process.env.REDIS_URL;
  if (!redisUrl) return null;
  queue = new Queue('whatsapp', redisUrl, {
    defaultJobOptions: { removeOnComplete: 100, removeOnFail: 50 },
  });
  queue.process(async (job) => {
    const doc = await MessageModel.findById(job.data.messageId);
    if (!doc) return;
    doc.status = 'sent';
    if (!doc.sentAt) doc.sentAt = new Date();
    await doc.save();
  });
  return queue;
}

async function enqueueWhatsApp(messageDoc) {
  const q = getQueue();
  if (!q) {
    messageDoc.status = 'sent';
    messageDoc.error = 'No Redis — message logged only';
    if (!messageDoc.sentAt) messageDoc.sentAt = new Date();
    await messageDoc.save();
    return;
  }
  await q.add(
    { messageId: String(messageDoc._id) },
    { attempts: 3, backoff: { type: 'exponential', delay: 2000 } }
  );
}

module.exports = { getQueue, enqueueWhatsApp };
