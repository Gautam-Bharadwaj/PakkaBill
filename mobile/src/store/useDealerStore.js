import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as dealerApi from '../api/dealer.api';
import logger from '../utils/logger';

const useDealerStore = create(
  persist(
    (set, get) => ({
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
          return data.data;
        } catch (err) {
          set({ error: err.response?.data?.message || 'Not found', isLoading: false });
          throw err;
        }
      },

      createDealer: async (dealerData) => {
        set({ isLoading: true, error: null });
        try {
          const { data } = await dealerApi.createDealer(dealerData);
          set((state) => ({ 
            dealers: [data.data, ...state.dealers], 
            isLoading: false 
          }));
          return data.data;
        } catch (err) {
          const msg = err.response?.data?.message || 'Create failed';
          set({ error: msg, isLoading: false });
          throw new Error(msg);
        }
      },

      updateDealer: async (id, dealerData) => {
        set({ isLoading: true, error: null });
        try {
          const { data } = await dealerApi.updateDealer(id, dealerData);
          set((state) => ({
            dealers: state.dealers.map((d) => (d._id === id ? data.data : d)),
            currentDealer: state.currentDealer?._id === id ? data.data : state.currentDealer,
            isLoading: false
          }));
          return data.data;
        } catch (err) {
          const msg = err.response?.data?.message || 'Update failed';
          set({ error: msg, isLoading: false });
          throw new Error(msg);
        }
      },

      deleteDealer: async (id) => {
        set({ isLoading: true, error: null });
        try {
          await dealerApi.deleteDealer(id);
          set((state) => ({ 
            dealers: state.dealers.filter((d) => d._id !== id), 
            isLoading: false 
          }));
        } catch (err) {
          const msg = err.response?.data?.message || 'Delete failed';
          set({ error: msg, isLoading: false });
          throw new Error(msg);
        }
      },
    }),
    {
      name: 'paakabill-dealer-store',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ dealers: state.dealers }), // Cache dealer list for offline search
    }
  )
);

export default useDealerStore;
