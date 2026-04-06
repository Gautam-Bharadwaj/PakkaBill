const env = require('./env');

let redis = null;

// Redis is optional — used for Bull job queues
const getRedis = () => {
  if (!redis) {
    try {
      const Redis = require('ioredis');
      redis = new Redis(env.REDIS_URL, {
        maxRetriesPerRequest: null,
        enableReadyCheck: false,
        lazyConnect: true,
      });
      redis.on('error', (err) => {
        console.warn('[Redis] Connection error (non-fatal):', err.message);
      });
    } catch (err) {
      console.warn('[Redis] Not available, queues will run in-memory');
      return null;
    }
  }
  return redis;
};

module.exports = { getRedis };
