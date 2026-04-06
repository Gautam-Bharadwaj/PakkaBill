import client from './client';
import { ENDPOINTS } from '../constants/api';

export const getDealers = (params) => client.get(ENDPOINTS.DEALERS, { params });
export const getDealer = (id) => client.get(ENDPOINTS.DEALER(id));
export const createDealer = (data) => client.post(ENDPOINTS.DEALERS, data);
export const updateDealer = (id, data) => client.put(ENDPOINTS.DEALER(id), data);
export const deleteDealer = (id) => client.delete(ENDPOINTS.DEALER(id));
export const getDealerInvoices = (id, params) => client.get(ENDPOINTS.DEALER_INVOICES(id), { params });
export const getDealerPayments = (id, params) => client.get(ENDPOINTS.DEALER_PAYMENTS(id), { params });
export const sendReminder = (id) => client.post(ENDPOINTS.DEALER_REMIND(id));
