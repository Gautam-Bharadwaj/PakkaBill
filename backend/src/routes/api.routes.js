const { Router } = require('express');
const { validateBody, validateQuery } = require('../middleware/validate.middleware');
const { authMiddleware } = require('../middleware/auth.middleware');
const validators = require('../validators');

const Auth = require('../controllers/Auth.controller');
const Dealer = require('../controllers/Dealer.controller');
const Product = require('../controllers/Product.controller');
const Invoice = require('../controllers/Invoice.controller');
const Payment = require('../controllers/Payment.controller');
const Dashboard = require('../controllers/Dashboard.controller');
const Template = require('../controllers/Template.controller');
const ML = require('../controllers/ML.controller');

const r = Router();

r.use(authMiddleware);

r.post('/auth/logout', Auth.logout);

r.get('/dashboard/summary', Dashboard.summary);
r.get('/dashboard/top-products', Dashboard.topProducts);
r.get('/dashboard/pending-dealers', Dashboard.pendingDealers);
r.get('/dashboard/ml-insights', Dashboard.mlInsights);

r.get('/dealers', validateQuery(validators.dealerListQuery), Dealer.list);
r.get('/dealers/:id', Dealer.getOne);
r.get('/dealers/:id/invoices', Dealer.invoices);
r.get('/dealers/:id/payments', Dealer.payments);
r.post('/dealers', validateBody(validators.dealerCreate), Dealer.create);
r.put('/dealers/:id', validateBody(validators.dealerUpdate), Dealer.update);
r.delete('/dealers/:id', Dealer.remove);

r.get('/products', Product.list);
r.get('/products/:id', Product.getOne);
r.post('/products', validateBody(validators.productCreate), Product.create);
r.put('/products/:id', validateBody(validators.productUpdate), Product.update);
r.delete('/products/:id', Product.remove);

r.post('/invoices/preview', validateBody(validators.invoicePreview), Invoice.preview);
r.post('/invoices', validateBody(validators.invoiceCreate), Invoice.create);
r.get('/invoices', validateQuery(validators.invoiceListQuery), Invoice.list);
r.get('/invoices/:id/payments', Payment.listByInvoice);
r.get('/invoices/:id/pdf', Invoice.downloadPdf);
r.get('/invoices/:id/upi-qr.png', Invoice.upiQrLegacy);
r.post('/invoices/:id/send-whatsapp', Invoice.sendWhatsApp);
r.get('/invoices/:id', Invoice.getOne);

r.post('/payments', validateBody(validators.paymentCreate), Payment.create);
r.get('/payments', Payment.listAll);
r.get('/payments/:invoiceId/qr', Payment.qrForInvoice);

r.get('/message-templates', Template.list);
r.post('/message-templates', validateBody(validators.templateUpsert), Template.upsert);

r.post('/ml/demand', ML.proxyDemand);
r.post('/ml/dealer-segments', ML.proxyDealer);
r.post('/ml/pricing', ML.proxyPricing);
r.get('/ml/low-margin', ML.proxyLowMargin);

module.exports = r;
