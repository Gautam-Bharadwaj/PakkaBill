import { create } from 'zustand';
import * as dashboardApi from '../api/dashboard.api.js';

const useDashboardStore = create((set) => ({
  summary: null, revenueChart: [], topProducts: [], pendingDealers: [], mlInsights: null, isLoading: false, error: null,
  fetchAll: async () => {
    set({ isLoading: true, error: null });
    try {
      const [s, c, p, d] = await Promise.all([
        dashboardApi.getDashboardSummary(),
        dashboardApi.getRevenueChart(30),
        dashboardApi.getTopProducts(5),
        dashboardApi.getPendingDealers(10),
      ]);
      set({ summary: s.data.data, revenueChart: c.data.data, topProducts: p.data.data, pendingDealers: d.data.data, isLoading: false });
    } catch (err) { set({ error: err.response?.data?.message || 'Failed', isLoading: false }); }
  },
  fetchMlInsights: async () => {
    try {
      const { data } = await dashboardApi.getMlInsights();
      set({ mlInsights: data.data });
    } catch { }
  },
}));

export default useDashboardStore;
