/**
 * WhatsApp service using whatsapp-web.js (primary) + Twilio (fallback for OTP)
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

  /**
   * Send OTP via WhatsApp.
   * Priority: Twilio API → whatsapp-web.js client → console fallback (dev)
   */
  async sendOtp(phone, otp) {
    const body =
      `*Billo Billings – OTP Verification*\n\n` +
      `Your one-time password is: *${otp}*\n` +
      `Valid for *5 minutes*. Do not share it with anyone.`;

    // 1️⃣ Twilio WhatsApp (production-grade, no session needed)
    if (env.TWILIO_ACCOUNT_SID && env.TWILIO_AUTH_TOKEN && env.TWILIO_WHATSAPP_FROM) {
      try {
        const twilio = require('twilio')(env.TWILIO_ACCOUNT_SID, env.TWILIO_AUTH_TOKEN);
        const cleanPhone = phone.replace(/\D/g, '');
        const to = cleanPhone.startsWith('91') ? `+${cleanPhone}` : `+91${cleanPhone}`;

        await twilio.messages.create({
          from: `whatsapp:${env.TWILIO_WHATSAPP_FROM}`,
          to: `whatsapp:${to}`,
          body,
        });

        console.log(`[WhatsApp] OTP sent via Twilio to ${to}`);
        return true;
      } catch (err) {
        console.error('[WhatsApp] Twilio OTP send failed:', err.message);
        // Fall through to whatsapp-web.js
      }
    }

    // 2️⃣ whatsapp-web.js local client
    if (this.ready && this.client) {
      try {
        const cleanPhone = phone.replace(/\D/g, '');
        const chatId = cleanPhone.startsWith('91') ? `${cleanPhone}@c.us` : `91${cleanPhone}@c.us`;
        await this.client.sendMessage(chatId, body);
        console.log(`[WhatsApp] OTP sent via local client to ${chatId}`);
        return true;
      } catch (err) {
        console.error('[WhatsApp] Local client OTP send failed:', err.message);
      }
    }

    // 3️⃣ Dev fallback — log to console
    console.log(`\n\n -----> [MOCK OTP] Phone: ${phone} | OTP: ${otp} <----- \n\n`);
    return false;
  }

  async sendMessage(phone, body, type, invoiceId, dealerId, mediaData = null) {
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
      const cleanPhone = phone.replace(/\D/g, ''); // 🧼 Sanitize
      const chatId = cleanPhone.startsWith('91') ? `${cleanPhone}@c.us` : `91${cleanPhone}@c.us`;
      
      let content = body;
      let options = {};

      if (mediaData) {
        const { MessageMedia } = require('whatsapp-web.js');
        content = new MessageMedia(mediaData.mimetype, mediaData.base64, mediaData.filename);
        options = { caption: body };
      }

      await this.client.sendMessage(chatId, content, options);
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

