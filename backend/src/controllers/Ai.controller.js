const gstSuggestionService = require('../services/ai/gstSuggestion.service');
const insightEngineService = require('../services/ai/insightEngine.service');
const chatAssistantService = require('../services/ai/chatAssistant.service');
const ApiResponse = require('../utils/ApiResponse');
const ApiError = require('../utils/ApiError');

class AiController {
  async getGstSuggestion(req, res, next) {
    try {
      const { product } = req.query;
      if (!product) throw ApiError.badRequest('Product name is required (use ?product=...)');
      const suggestion = await gstSuggestionService.getGSTDetails(product);
      ApiResponse.success(res, suggestion, 'GST suggestion fetched');
    } catch (err) { next(err); }
  }

  async getInsights(req, res, next) {
    try {
      const insights = await insightEngineService.generateInsights();
      ApiResponse.success(res, insights, 'AI insights generated');
    } catch (err) { next(err); }
  }

  async askChat(req, res, next) {
    try {
      const { question } = req.body;
      if (!question) throw ApiError.badRequest('Question is required');
      const response = await chatAssistantService.askQuestion(question);
      ApiResponse.success(res, response, 'Chat response generated');
    } catch (err) { next(err); }
  }
}

module.exports = new AiController();
