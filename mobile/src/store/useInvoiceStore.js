import { create } from 'zustand';
import * as invoiceApi from '../api/invoice.api';
import logger from '../utils/logger';
import { saveInvoiceOffline, getOfflineInvoices, markInvoiceSynced, getUnsyncedInvoices } from '../utils/offline';
import NetInfo from '@react-native-community/netinfo';

const useInvoiceStore = create((set, get) => ({
  invoices: [],
  currentInvoice: null,
  pagination: null,
  isLoading: false,
  error: null,

  fetchInvoices: async (params = {}) => {
    set({ isLoading: true, error: null });
    try {
      const net = await NetInfo.fetch();
      let apiInvoices = [];
      let offlineInvoices = await getOfflineInvoices();

      if (net.isConnected) {
        const { data } = await invoiceApi.getInvoices(params);
        apiInvoices = data.data;
        // Merge offline invoices that aren't synced yet
        const unsynced = offlineInvoices.filter(i => i.isSynced === 0);
        set({ 
          invoices: [...unsynced, ...apiInvoices], 
          pagination: data.pagination, 
          isLoading: false 
        });
      } else {
        set({ invoices: offlineInvoices, isLoading: false });
      }
    } catch (err) {
      const offlineInvoices = await getOfflineInvoices();
      set({ invoices: offlineInvoices, error: 'Loaded from local storage (Offline)', isLoading: false });
      logger.error('[InvoiceStore] fetchInvoices', err);
    }
  },

  fetchInvoice: async (id) => {
    set({ isLoading: true, currentInvoice: null });
    try {
      const { data } = await invoiceApi.getInvoice(id);
      set({ currentInvoice: data.data, isLoading: false });
    } catch (err) {
      // Check offline
      const offline = await getOfflineInvoices();
      const inv = offline.find(i => i._id === id || i.id === id);
      if (inv) set({ currentInvoice: inv, isLoading: false });
      else set({ isLoading: false });
    }
  },

  createInvoice: async (invoiceData) => {
    try {
      const net = await NetInfo.fetch();
      if (net.isConnected) {
        const { data } = await invoiceApi.createInvoice(invoiceData);
        await saveInvoiceOffline(data.data, 1); // Save as synced
        set((state) => ({ invoices: [data.data, ...state.invoices] }));
        return data.data;
      } else {
        throw new Error('OFFLINE');
      }
    } catch (err) {
      // Offline fallback
      const tempId = 'offline_' + Date.now();
      const offlineBill = {
        _id: tempId,
        id: tempId,
        ...invoiceData,
        isSynced: 0,
        createdAt: new Date().toISOString()
      };
      await saveInvoiceOffline(offlineBill, 0);
      set((state) => ({ invoices: [offlineBill, ...state.invoices] }));
      return offlineBill;
    }
  },

  syncOfflineData: async () => {
    const unsynced = await getUnsyncedInvoices();
    if (unsynced.length === 0) return;

    for (const inv of unsynced) {
        try {
            const { data } = await invoiceApi.createInvoice(inv);
            await markInvoiceSynced(inv.id);
            logger.info('[Sync] Invoice synced: ' + inv.id);
        } catch (err) {
            logger.error('[Sync] Failed for: ' + inv.id, err);
        }
    }
    get().fetchInvoices();
  },

  updateInvoice: async (id, invoiceData) => {
    set({ isLoading: true });
    try {
      const { data } = await invoiceApi.updateInvoice(id, invoiceData);
      set((state) => ({
        invoices: state.invoices.map((i) => (i._id === id ? data.data : i)),
        currentInvoice: data.data,
        isLoading: false
      }));
      return data.data;
    } catch (err) {
      set({ isLoading: false });
      throw err;
    }
  },

  getUnpaidCount: () => get().invoices.filter((inv) => inv.paymentStatus !== 'paid').length,
}));

export default useInvoiceStore;
