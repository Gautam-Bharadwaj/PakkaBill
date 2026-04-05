require('dotenv').config();
require('./config/env').loadEnv();

const { connectDatabase } = require('./config/database');
const app = require('./app');

require('./services/WhatsApp.service');

const { scheduleReminders } = require('./jobs/reminder.job');

const port = Number(process.env.PORT || 4000);
const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/billo';

connectDatabase(uri)
  .then(() => {
    if (process.env.NODE_ENV !== 'test') {
      scheduleReminders();
    }
    app.listen(port, () => {
      // eslint-disable-next-line no-console
      console.log(`Billo API listening on :${port}`);
    });
  })
  .catch((error) => {
    // eslint-disable-next-line no-console
    console.error('Mongo connection failed', error);
    process.exit(1);
  });
