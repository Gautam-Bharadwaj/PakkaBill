const dealerService = require('../services/Dealer.service');
const whatsappService = require('../services/WhatsApp.service');
const ApiResponse = require('../utils/ApiResponse');

class DealerController {
  async list(req, res, next) {
    try {
      const { q = '', status = 'all', page = 1, limit = 20 } = req.query;
      const result = await dealerService.list(q, status, Number(page), Number(limit));
      ApiResponse.success(res, result.data, 'Dealers fetched', 200, result.pagination);
    } catch (err) { next(err); }
  }

  async getById(req, res, next) {
    try {
      const dealer = await dealerService.getById(req.params.id);
      ApiResponse.success(res, dealer, 'Dealer fetched');
    } catch (err) { next(err); }
  }

  async create(req, res, next) {
    try {
      const dealer = await dealerService.create(req.body);
      ApiResponse.created(res, dealer, 'Dealer created');
    } catch (err) { next(err); }
  }

  async update(req, res, next) {
    try {
      const dealer = await dealerService.update(req.params.id, req.body);
      ApiResponse.success(res, dealer, 'Dealer updated');
    } catch (err) { next(err); }
  }

  async delete(req, res, next) {
    try {
      await dealerService.delete(req.params.id);
      ApiResponse.success(res, null, 'Dealer deleted');
    } catch (err) { next(err); }
  }

  async sendReminder(req, res, next) {
    try {
      const dealer = await dealerService.getById(req.params.id);
      const message = whatsappService.buildReminderMessage(dealer, { invoiceId: 'PENDING', amountDue: dealer.pendingAmount });
      const link = whatsappService.getWhatsAppLink(dealer.phone, message);
      ApiResponse.success(res, { link, message }, 'Reminder link generated');
    } catch (err) { next(err); }
  }
}

module.exports = new DealerController();
