const Joi = require('joi');

const schema = Joi.object({
  NODE_ENV: Joi.string().valid('development', 'production', 'test').default('development'),
  PORT: Joi.number().default(4000),
  MONGODB_URI: Joi.string().default('mongodb://127.0.0.1:27017/billo'),
  JWT_ACCESS_SECRET: Joi.string().min(32).default('dev-jwt-access-secret-min-32-chars!!'),
  JWT_REFRESH_SECRET: Joi.string().min(32).default('dev-jwt-refresh-secret-min-32-chars!'),
  JWT_ACCESS_EXPIRES: Joi.string().default('15m'),
  JWT_REFRESH_EXPIRES: Joi.string().default('7d'),
  REDIS_URL: Joi.string().allow('', null),
  ML_SERVICE_URL: Joi.string().uri().default('http://127.0.0.1:8000'),
  BUSINESS_NAME: Joi.string().allow(''),
  BUSINESS_ADDRESS: Joi.string().allow(''),
  BUSINESS_GSTIN: Joi.string().allow(''),
  UPI_VPA: Joi.string().allow(''),
  UPI_PAYEE_NAME: Joi.string().allow(''),
  PDF_STORAGE_DIR: Joi.string().default('./storage/pdfs'),
  CORS_ORIGINS: Joi.string().default('*'),
  RATE_LIMIT_MAX: Joi.number().default(100),
}).unknown(true);

function loadEnv() {
  const { error, value } = schema.validate(process.env, { abortEarly: false });
  if (error) {
    throw new Error(`Invalid environment: ${error.details.map((detail) => detail.message).join(', ')}`);
  }
  Object.assign(process.env, value);
}

module.exports = { loadEnv };
