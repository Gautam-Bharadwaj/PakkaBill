const openai = require('./openai.client');
const invoiceService = require('../Invoice.service');
const dealerService = require('../Dealer.service');

class ChatAssistantService {
  async askQuestion(question) {
    if (!openai) {
      return { answer: "I'm currently in mock mode. Please add your OpenAI key to the .env variables to use the AI assistant." };
    }

    try {
      // 📊 Step 1: Gather real-time data context
      const stats = await invoiceService.getDashboardSummary();
      const dealers = await dealerService.list('', 1, 5); // Just top few
      
      const context = `
        Current Business State:
        - Total Revenue (MTD): Rs. ${stats.totalRevenueMTD}
        - Total Pending Dues (Total): Rs. ${stats.totalPendingAmount}
        - Total Invoices: ${stats.totalInvoices}
        - Recent Customers: ${dealers.data.map(d => d.name).join(', ')}
      `;

      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: "You are 'Billo AI', a helpful financial assistant. ${context} Answer concisely in professional English/Hindi." },
          { role: "user", content: question }
        ]
      });

      return { answer: completion.choices[0].message.content };
    } catch (error) {
      console.error('[AI] Chat assistant failed:', error.message);
      return { answer: "Sorry, my servers are currently busy. Please try again later." };
    }
  }
}

module.exports = new ChatAssistantService();
