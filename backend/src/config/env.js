require('dotenv').config();

const env = {
  PORT: process.env.PORT || 5001,
  NODE_ENV: process.env.NODE_ENV || 'development',
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://localhost:27017/billobillings',
  JWT_SECRET: process.env.JWT_SECRET || 'default-secret-change-me',
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || 'default-refresh-secret',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '1h',
  JWT_REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  REDIS_URL: process.env.REDIS_URL || 'redis://localhost:6379',
  UPI_VPA: process.env.UPI_VPA || 'yourname@upi',
  UPI_NAME: process.env.UPI_NAME || 'Billo Billings',
  WHATSAPP_ENABLED: process.env.WHATSAPP_ENABLED === 'true',
  ML_SERVICE_URL: process.env.ML_SERVICE_URL || 'http://localhost:8000',
  ADMIN_PIN: process.env.ADMIN_PIN || '123456',
};

module.exports = env;
