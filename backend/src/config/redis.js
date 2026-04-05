const { createClient } = require('redis');

/** Singleton Redis client (optional — Bull falls back if missing) */
let client = null;

async function getRedisClient() {
  const url = process.env.REDIS_URL;
  if (!url) return null;
  if (!client) {
    client = createClient({ url });
    client.on('error', (err) => console.error('Redis error', err));
    await client.connect();
  }
  return client;
}

module.exports = { getRedisClient };
