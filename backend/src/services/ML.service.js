/**
 * Facade to Python FastAPI — singleton-style module.
 */
class MLService {
  async fetchJson(path, options = {}) {
    const base = process.env.ML_SERVICE_URL || 'http://127.0.0.1:8000';
    try {
      const response = await fetch(`${base}${path}`, {
        method: options.method || 'GET',
        headers: { 'Content-Type': 'application/json', ...options.headers },
        body: options.body ? JSON.stringify(options.body) : undefined,
      });
      const data = await response.json();
      return { ok: response.ok, status: response.status, data };
    } catch (error) {
      return {
        ok: false,
        status: 502,
        data: { error: 'ML service unavailable', detail: String(error.message) },
      };
    }
  }

  async predictDemand(body) {
    return this.fetchJson('/predict/demand', { method: 'POST', body });
  }

  async analyzeDealers(body) {
    return this.fetchJson('/analyze/dealer', { method: 'POST', body });
  }

  async optimizePricing(body) {
    return this.fetchJson('/optimize/pricing', { method: 'POST', body });
  }

  async lowMargin() {
    return this.fetchJson('/detect/low-margin', { method: 'GET' });
  }
}

module.exports = new MLService();
