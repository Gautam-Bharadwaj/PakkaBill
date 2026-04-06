import { create } from 'zustand';
import * as productApi from '../api/product.api.js';

const useProductStore = create((set) => ({
  products: [], currentProduct: null, pagination: null, isLoading: false, error: null,
  fetchProducts: async (params = {}) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await productApi.getProducts(params);
      set({ products: data.data, pagination: data.pagination, isLoading: false });
    } catch (err) { set({ error: err.response?.data?.message || 'Failed', isLoading: false }); }
  },
  fetchProduct: async (id) => {
    const { data } = await productApi.getProduct(id);
    set({ currentProduct: data.data });
    return data.data;
  },
  createProduct: async (d) => {
    const { data } = await productApi.createProduct(d);
    set((s) => ({ products: [data.data, ...s.products] }));
    return data.data;
  },
  updateProduct: async (id, d) => {
    const { data } = await productApi.updateProduct(id, d);
    set((s) => ({ products: s.products.map((x) => x._id === id ? data.data : x) }));
    return data.data;
  },
  deleteProduct: async (id) => {
    await productApi.deleteProduct(id);
    set((s) => ({ products: s.products.filter((p) => p._id !== id) }));
  },
}));

export default useProductStore;
