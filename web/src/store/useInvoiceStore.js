import { create } from 'zustand';
import * as invoiceApi from '../api/invoice.api.js';

const useInvoiceStore = create((set) => ({
  invoices: [], currentInvoice: null, pagination: null, isLoading: false, error: null,
  fetchInvoices: async (params = {}) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await invoiceApi.getInvoices(params);
      set({ invoices: data.data, pagination: data.pagination, isLoading: false });
    } catch (err) { set({ error: err.response?.data?.message || 'Failed', isLoading: false }); }
  },
  fetchInvoice: async (id) => {
    set({ isLoading: true, currentInvoice: null });
    try {
      const { data } = await invoiceApi.getInvoice(id);
      set({ currentInvoice: data.data, isLoading: false });
    } catch { set({ isLoading: false }); }
  },
  createInvoice: async (d) => {
    const { data } = await invoiceApi.createInvoice(d);
    return data.data;
  },
}));

export default useInvoiceStore;
