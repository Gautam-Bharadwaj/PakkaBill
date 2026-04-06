import client from './client.js';
export const getDealers = (params) => client.get('/dealers', { params });
export const getDealer = (id) => client.get(`/dealers/${id}`);
export const createDealer = (data) => client.post('/dealers', data);
export const updateDealer = (id, data) => client.put(`/dealers/${id}`, data);
export const deleteDealer = (id) => client.delete(`/dealers/${id}`);
export const getDealerInvoices = (id, params) => client.get(`/dealers/${id}/invoices`, { params });
export const getDealerPayments = (id, params) => client.get(`/dealers/${id}/payments`, { params });
export const sendReminder = (id) => client.post(`/dealers/${id}/remind`);
