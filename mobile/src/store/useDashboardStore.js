import { create } from 'zustand';
import * as dashboardApi from '../api/dashboard.api';
import { getInvoices } from '../api/invoice.api';
import logger from '../utils/logger';

const useDashboardStore = create((set) => ({
  summary: null,
  revenueChart: [],
  topProducts: [],
  pendingDealers: [],
  recentInvoices: [], // Track actual recent activity
  mlInsights: null,
  isLoading: false,
  error: null,

  fetchAll: async () => {
    set({ isLoading: true, error: null });
    try {
      const [feedRes, invoicesRes] = await Promise.all([
        dashboardApi.getDashboardFeed(),
        getInvoices({ limit: 5 }), 
      ]);

      const { summary, chart, products, dealers } = feedRes.data.data;

      set({
        summary,
        revenueChart: chart || [],
        topProducts: products || [],
        pendingDealers: dealers || [],
        recentInvoices: invoicesRes.data.data || [],
        isLoading: false,
      });
    } catch (err) {
      set({ error: err.response?.data?.message || 'Dashboard load failed', isLoading: false });
      logger.error('[DashboardStore] fetchAll', err);
    }
  },

  fetchMlInsights: async () => {
    try {
      const { data } = await dashboardApi.getMlInsights();
      set({ mlInsights: data.data });
    } catch (err) {
      logger.warn('[DashboardStore] fetchMlInsights', err);
    }
  },
}));

export default useDashboardStore;
