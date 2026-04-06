import { create } from 'zustand';
import * as dealerApi from '../api/dealer.api.js';

const useDealerStore = create((set, get) => ({
  dealers: [], currentDealer: null, pagination: null, isLoading: false, error: null,
  fetchDealers: async (params = {}) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await dealerApi.getDealers(params);
      set({ dealers: data.data, pagination: data.pagination, isLoading: false });
    } catch (err) {
      set({ error: err.response?.data?.message || 'Failed', isLoading: false });
    }
  },
  fetchDealer: async (id) => {
    set({ isLoading: true });
    try {
      const { data } = await dealerApi.getDealer(id);
      set({ currentDealer: data.data, isLoading: false });
    } catch { set({ isLoading: false }); }
  },
  createDealer: async (d) => {
    const { data } = await dealerApi.createDealer(d);
    set((s) => ({ dealers: [data.data, ...s.dealers] }));
    return data.data;
  },
  updateDealer: async (id, d) => {
    const { data } = await dealerApi.updateDealer(id, d);
    set((s) => ({ dealers: s.dealers.map((x) => x._id === id ? data.data : x), currentDealer: data.data }));
    return data.data;
  },
  deleteDealer: async (id) => {
    await dealerApi.deleteDealer(id);
    set((s) => ({ dealers: s.dealers.filter((d) => d._id !== id) }));
  },
}));

export default useDealerStore;
