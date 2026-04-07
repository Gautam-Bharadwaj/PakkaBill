const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const connectDB = require('./config/database');
const env = require('./config/env');
const errorMiddleware = require('./middleware/error.middleware');
const { apiLimiter } = require('./middleware/rateLimiter');
const authService = require('./services/Auth.service');
const whatsappService = require('./services/WhatsApp.service');

// Routes
const authRoutes = require('./routes/auth.routes');
const dealerRoutes = require('./routes/dealer.routes');
const productRoutes = require('./routes/product.routes');
const invoiceRoutes = require('./routes/invoice.routes');
const paymentRoutes = require('./routes/payment.routes');
const dashboardRoutes = require('./routes/dashboard.routes');

const app = express();

// Security + logging
app.use(helmet());
app.use(cors());
app.use(morgan(env.NODE_ENV === 'production' ? 'combined' : 'dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Rate limiting
app.use('/api', apiLimiter);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', env: env.NODE_ENV, ts: new Date().toISOString() });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/dealers', dealerRoutes);
app.use('/api/products', productRoutes);
app.use('/api/invoices', invoiceRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/dashboard', dashboardRoutes);

// 404
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` });
});

// Global error handler
app.use(errorMiddleware);

// Start server
const start = async () => {
  await connectDB();
  await authService.ensureAdminExists();
  // Initialize WhatsApp in background to prevent boot blocking
  whatsappService.initialize().catch(err => console.error('[WhatsApp] Startup failed:', err));

  app.listen(env.PORT, () => {
    console.log(`[Server] Billo Billings API running on port ${env.PORT} (${env.NODE_ENV})`);
    console.log(`[Server] Health: http://localhost:${env.PORT}/health`);
  });
};

start().catch((err) => {
  console.error('[Server] Fatal startup error:', err);
  process.exit(1);
});

module.exports = app;
