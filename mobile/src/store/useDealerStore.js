import { create } from 'zustand';
import * as dealerApi from '../api/dealer.api';
import logger from '../utils/logger';

const useDealerStore = create((set, get) => ({
  dealers: [],
  currentDealer: null,
  pagination: null,
  isLoading: false,
  error: null,

  fetchDealers: async (params = {}) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await dealerApi.getDealers(params);
      set({ dealers: data.data, pagination: data.pagination, isLoading: false });
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to fetch dealers';
      set({ error: msg, isLoading: false });
      logger.error('[DealerStore] fetchDealers', err);
    }
  },

  fetchDealer: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await dealerApi.getDealer(id);
      set({ currentDealer: data.data, isLoading: false });
    } catch (err) {
      set({ error: err.response?.data?.message || 'Not found', isLoading: false });
    }
  },

  createDealer: async (dealerData) => {
    const { data } = await dealerApi.createDealer(dealerData);
    set((state) => ({ dealers: [data.data, ...state.dealers] }));
    return data.data;
  },

  updateDealer: async (id, dealerData) => {
    const { data } = await dealerApi.updateDealer(id, dealerData);
    set((state) => ({
      dealers: state.dealers.map((d) => (d._id === id ? data.data : d)),
      currentDealer: state.currentDealer?._id === id ? data.data : state.currentDealer,
    }));
    return data.data;
  },

  deleteDealer: async (id) => {
    await dealerApi.deleteDealer(id);
    set((state) => ({ dealers: state.dealers.filter((d) => d._id !== id) }));
  },
}));

export default useDealerStore;
