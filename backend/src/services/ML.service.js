const axios = require('axios');
const env = require('../config/env');

class MLService {
  constructor() {
    this.baseURL = env.ML_SERVICE_URL;
    this.client = axios.create({ baseURL: this.baseURL, timeout: 10000 });
  }

  async getDemandPredictions() {
    try {
      const { data } = await this.client.get('/demand/predict');
      return data;
    } catch (err) {
      console.error('[ML Service] Demand prediction failed:', err.message);
      return this._mockDemand();
    }
  }

  async getDealerSegments() {
    try {
      const { data } = await this.client.get('/dealer/segment');
      return data;
    } catch (err) {
      console.error('[ML Service] Dealer segmentation failed:', err.message);
      return this._mockSegments();
    }
  }

  async getPricingSuggestions() {
    try {
      const { data } = await this.client.get('/pricing/suggest');
      return data;
    } catch (err) {
      console.error('[ML Service] Pricing suggestion failed:', err.message);
      return this._mockPricing();
    }
  }

  async getMarginAlerts() {
    try {
      const { data } = await this.client.get('/margin/alerts');
      return data;
    } catch (err) {
      console.error('[ML Service] Margin alerts failed:', err.message);
      return this._mockMarginAlerts();
    }
  }

  _mockDemand() {
    return [
      { product: 'A4 Ruled Notebook', expectedUnits: 240, confidence: 0.87 },
      { product: 'B5 Graph Notebook', expectedUnits: 180, confidence: 0.79 },
      { product: 'Spiral Notepad', expectedUnits: 150, confidence: 0.72 },
    ];
  }

  _mockSegments() {
    return {
      highValue: ['Sharma Traders', 'Kumar Stationery'],
      atRisk: ['Patel Books'],
      dormant: ['Singh Wholesale'],
    };
  }

  _mockPricing() {
    return [
      { product: 'A4 Ruled', currentPrice: 45, suggestedPrice: 52, currentMargin: 18, expectedMargin: 26 },
      { product: 'Spiral Pad', currentPrice: 35, suggestedPrice: 40, currentMargin: 22, expectedMargin: 32 },
    ];
  }

  _mockMarginAlerts() {
    return [
      { product: 'Budget Notepad 200pg', marginPercent: 8, threshold: 15 },
      { product: 'Economy Grid Sheet', marginPercent: 11, threshold: 15 },
    ];
  }
}

module.exports = new MLService();
