import client from './client';
import { ENDPOINTS } from '../constants/api';

export const getProducts = (params) => client.get(ENDPOINTS.PRODUCTS, { params });
export const getProduct = (id) => client.get(ENDPOINTS.PRODUCT(id));
export const createProduct = (data) => client.post(ENDPOINTS.PRODUCTS, data);
export const updateProduct = (id, data) => client.put(ENDPOINTS.PRODUCT(id), data);
export const deleteProduct = (id) => client.delete(ENDPOINTS.PRODUCT(id));
