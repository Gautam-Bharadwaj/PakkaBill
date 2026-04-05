const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const mongoSanitize = require('express-mongo-sanitize');
const morgan = require('morgan');

const { apiLimiter } = require('./middleware/rateLimiter');
const { errorMiddleware } = require('./middleware/error.middleware');
const authRoutes = require('./routes/auth.routes');
const apiRoutes = require('./routes/api.routes');

const app = express();

app.use(helmet());
app.use(
  cors({
    origin: process.env.CORS_ORIGINS === '*' ? true : (process.env.CORS_ORIGINS || '').split(',').filter(Boolean),
    credentials: true,
  })
);
app.use(cookieParser());
app.use(express.json({ limit: '1mb' }));
app.use(mongoSanitize());
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
app.use(apiLimiter);

app.get('/health', (req, res) => res.json({ ok: true }));

app.use('/api/auth', authRoutes);
app.use('/api', apiRoutes);

app.use(errorMiddleware);

module.exports = app;
