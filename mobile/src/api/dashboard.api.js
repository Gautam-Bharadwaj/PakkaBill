import client from './client';
import { ENDPOINTS } from '../constants/api';

export const getDashboardSummary = () => client.get(ENDPOINTS.DASHBOARD_SUMMARY);
export const getRevenueChart = (days = 30) => client.get(ENDPOINTS.DASHBOARD_CHART, { params: { days } });
export const getTopProducts = (limit = 5) => client.get(ENDPOINTS.DASHBOARD_TOP_PRODUCTS, { params: { limit } });
export const getPendingDealers = (limit = 10) => client.get(ENDPOINTS.DASHBOARD_PENDING_DEALERS, { params: { limit } });
export const getMlInsights = () => client.get(ENDPOINTS.DASHBOARD_ML);
