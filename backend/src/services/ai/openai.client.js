const { OpenAI } = require('openai');
const env = require('../../config/env');

let openai = null;
if (env.OPENAI_API_KEY) {
  openai = new OpenAI({ apiKey: env.OPENAI_API_KEY });
} else {
  console.warn('[AI] OPENAI_API_KEY is not set. AI features will run in mock mode.');
}

module.exports = openai;
