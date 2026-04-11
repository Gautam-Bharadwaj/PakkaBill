const openai = require('./openai.client');
const invoiceRepo = require('../../repositories/Invoice.repository');

class InsightEngineService {
  async generateInsights() {
    const summary = await invoiceRepo.getMonthlySummary();
    
    if (!openai) {
      return [
        `Revenue is Rs. ${summary.totalRevenue} this month.`,
        `${summary.invoiceCount} invoices generated this month.`
      ];
    }

    try {
      const promptData = JSON.stringify(summary);
      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: "You are a business analytics AI targeting Indian small business owners. Based on the JSON metrics, generate 3 extremely short, punchy business insights in plain english. The insights must be actionable or celebratory. Return an array of strings in JSON format, like ['insight 1', 'insight 2', 'insight 3']." },
          { role: "user", content: `Data: ${promptData}` }
        ],
        response_format: { type: "json_object" } // Using response_format for safety
      });

      const text = completion.choices[0].message.content;
      try {
        const parsed = JSON.parse(text);
        if (parsed.insights && Array.isArray(parsed.insights)) return parsed.insights;
        // Sometimes it responds with just a JSON array even if told json_object, but if it has a root array the parser handles it.
        if (Array.isArray(parsed)) return parsed;
        const firstKey = Object.keys(parsed)[0];
        if (Array.isArray(parsed[firstKey])) return parsed[firstKey];
        return [text];
      } catch(e) {
        return text.split('\\n').filter(l => l.trim().length > 0).map(l => l.replace(/^[-*0-9.]\\s*/, ''));
      }
    } catch (error) {
      console.error('[AI] Insight Engine failed:', error.message);
      return [`Revenue is Rs. ${summary.totalRevenue} this month.`];
    }
  }
}

module.exports = new InsightEngineService();
