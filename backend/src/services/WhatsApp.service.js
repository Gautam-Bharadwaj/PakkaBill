/**
 * WhatsApp service using whatsapp-web.js
 * PATTERN: Observer — notifies on message status changes
 * Note: Initializes lazily and only when WHATSAPP_ENABLED=true
 */
const env = require('../config/env');
const Message = require('../models/Message.model');

class WhatsAppService {
  constructor() {
    this.client = null;
    this.ready = false;
  }

  async initialize() {
    if (!env.WHATSAPP_ENABLED) {
      console.log('[WhatsApp] Disabled via env');
      return;
    }

    try {
      const { Client, LocalAuth } = require('whatsapp-web.js');
      this.client = new Client({
        authStrategy: new LocalAuth(),
        puppeteer: { headless: true, args: ['--no-sandbox'] },
      });

      this.client.on('ready', () => {
        this.ready = true;
        console.log('[WhatsApp] Client ready');
      });

      this.client.on('qr', (qr) => {
        console.log('[WhatsApp] Scan this QR to authenticate:');
        // In production, show QR via API endpoint
      });

      this.client.on('disconnected', () => {
        this.ready = false;
        console.warn('[WhatsApp] Client disconnected');
      });

      await this.client.initialize();
    } catch (err) {
      console.warn('[WhatsApp] Init failed:', err.message);
    }
  }

  async sendMessage(phone, body, type, invoiceId, dealerId) {
    const log = await Message.create({
      to: phone,
      type,
      invoice: invoiceId,
      dealer: dealerId,
      body,
      status: 'pending',
    });

    if (!this.ready || !this.client) {
      await Message.findByIdAndUpdate(log._id, { status: 'failed', error: 'Client not ready' });
      console.warn(`[WhatsApp] Not ready — message not sent to ${phone}`);
      return false;
    }

    try {
      const chatId = `91${phone}@c.us`;
      await this.client.sendMessage(chatId, body);
      await Message.findByIdAndUpdate(log._id, { status: 'sent', sentAt: new Date() });
      return true;
    } catch (err) {
      await Message.findByIdAndUpdate(log._id, { status: 'failed', error: err.message });
      console.error('[WhatsApp] Send error:', err.message);
      return false;
    }
  }

  buildInvoiceMessage(invoice) {
    return (
      `*Invoice from Billo Billings*\n\n` +
      `Invoice ID: ${invoice.invoiceId}\n` +
      `Date: ${new Date(invoice.createdAt).toLocaleDateString('en-IN')}\n` +
      `Total: Rs. ${invoice.totalAmount.toFixed(2)}\n` +
      `Amount Due: Rs. ${invoice.amountDue.toFixed(2)}\n\n` +
      `Thank you for your business!`
    );
  }

  buildReminderMessage(dealer, invoice) {
    return (
      `*Payment Reminder — Billo Billings*\n\n` +
      `Dear ${dealer.name},\n` +
      `This is a reminder for pending payment on Invoice *${invoice.invoiceId}*.\n\n` +
      `Amount Due: *Rs. ${invoice.amountDue.toFixed(2)}*\n\n` +
      `Please clear this at the earliest. Thank you!`
    );
  }

  getWhatsAppLink(phone, message) {
    const encoded = encodeURIComponent(message);
    return `https://wa.me/91${phone}?text=${encoded}`;
  }
}

module.exports = new WhatsAppService();
