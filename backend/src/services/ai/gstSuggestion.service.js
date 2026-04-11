const openai = require('./openai.client');

class GSTSuggestionService {
  async getGSTDetails(productName) {
    if (!openai) return this.mockGstResponse(productName);

    try {
      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: "You are a GST and HSN code classification assistant for Indian businesses. Return only a JSON object containing the fields: 'hsnCode' (string), 'gstRate' (number), 'category' (string). If an item is exempt from GST, set gstRate to 0." },
          { role: "user", content: `Suggest HSN code and GST rate for: ${productName}` }
        ],
        response_format: { type: "json_object" }
      });

      const result = JSON.parse(completion.choices[0].message.content);
      return result;
    } catch (error) {
      console.error('[AI] GST Suggestion failed:', error.message);
      return this.mockGstResponse(productName);
    }
  }

  mockGstResponse(productName) {
    const nameLower = productName.toLowerCase();
    if (nameLower.includes('notebook') || nameLower.includes('paper')) {
      return { hsnCode: '4820', gstRate: 18, category: 'Stationery' };
    }
    return { hsnCode: '0000', gstRate: 5, category: 'General' };
  }
}

module.exports = new GSTSuggestionService();
