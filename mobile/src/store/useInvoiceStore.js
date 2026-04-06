import { create } from 'zustand';
import * as invoiceApi from '../api/invoice.api';
import logger from '../utils/logger';

const useInvoiceStore = create((set) => ({
  invoices: [],
  currentInvoice: null,
  pagination: null,
  isLoading: false,
  error: null,

  fetchInvoices: async (params = {}) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await invoiceApi.getInvoices(params);
      set({ invoices: data.data, pagination: data.pagination, isLoading: false });
    } catch (err) {
      set({ error: err.response?.data?.message || 'Failed to load invoices', isLoading: false });
      logger.error('[InvoiceStore] fetchInvoices', err);
    }
  },

  fetchInvoice: async (id) => {
    set({ isLoading: true, currentInvoice: null });
    try {
      const { data } = await invoiceApi.getInvoice(id);
      set({ currentInvoice: data.data, isLoading: false });
    } catch (err) {
      set({ isLoading: false });
    }
  },

  createInvoice: async (invoiceData) => {
    const { data } = await invoiceApi.createInvoice(invoiceData);
    set((state) => ({ invoices: [data.data, ...state.invoices] }));
    return data.data;
  },

  getUnpaidCount: (state) => {
    return state.invoices.filter((inv) => inv.paymentStatus !== 'paid').length;
  },
}));

export default useInvoiceStore;
