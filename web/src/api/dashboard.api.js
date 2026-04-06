import client from './client.js';
export const getDashboardSummary = () => client.get('/dashboard/summary');
export const getRevenueChart = (days = 30) => client.get('/dashboard/revenue-chart', { params: { days } });
export const getTopProducts = (limit = 5) => client.get('/dashboard/top-products', { params: { limit } });
export const getPendingDealers = (limit = 10) => client.get('/dashboard/pending-dealers', { params: { limit } });
export const getMlInsights = () => client.get('/dashboard/ml-insights');
