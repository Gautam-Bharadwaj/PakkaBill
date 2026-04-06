import { create } from 'zustand';
import * as productApi from '../api/product.api';
import logger from '../utils/logger';

const useProductStore = create((set) => ({
  products: [],
  currentProduct: null,
  pagination: null,
  isLoading: false,
  error: null,

  fetchProducts: async (params = {}) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await productApi.getProducts(params);
      set({ products: data.data, pagination: data.pagination, isLoading: false });
    } catch (err) {
      set({ error: err.response?.data?.message || 'Failed to load products', isLoading: false });
      logger.error('[ProductStore] fetchProducts', err);
    }
  },

  fetchProduct: async (id) => {
    set({ isLoading: true });
    try {
      const { data } = await productApi.getProduct(id);
      set({ currentProduct: data.data, isLoading: false });
    } catch (err) {
      set({ isLoading: false });
    }
  },

  createProduct: async (productData) => {
    const { data } = await productApi.createProduct(productData);
    set((state) => ({ products: [data.data, ...state.products] }));
    return data.data;
  },

  updateProduct: async (id, productData) => {
    const { data } = await productApi.updateProduct(id, productData);
    set((state) => ({
      products: state.products.map((p) => (p._id === id ? data.data : p)),
    }));
    return data.data;
  },

  deleteProduct: async (id) => {
    await productApi.deleteProduct(id);
    set((state) => ({ products: state.products.filter((p) => p._id !== id) }));
  },
}));

export default useProductStore;
