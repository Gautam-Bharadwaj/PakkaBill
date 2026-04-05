const mongoose = require('mongoose');

/** Singleton Mongo connection */
let connected = false;

async function connectDatabase(uri) {
  if (connected) return mongoose.connection;
  mongoose.set('strictQuery', true);
  await mongoose.connect(uri);
  connected = true;
  return mongoose.connection;
}

function getConnection() {
  return mongoose.connection;
}

module.exports = { connectDatabase, getConnection };
