const { Router } = require('express');
const dashboardController = require('../controllers/Dashboard.controller');
const authMiddleware = require('../middleware/auth.middleware');

const router = Router();
router.use(authMiddleware);

router.get('/summary', dashboardController.getSummary.bind(dashboardController));
router.get('/revenue-chart', dashboardController.getRevenueChart.bind(dashboardController));
router.get('/top-products', dashboardController.getTopProducts.bind(dashboardController));
router.get('/pending-dealers', dashboardController.getPendingDealers.bind(dashboardController));
router.get('/ml-insights', dashboardController.getMlInsights.bind(dashboardController));

module.exports = router;
