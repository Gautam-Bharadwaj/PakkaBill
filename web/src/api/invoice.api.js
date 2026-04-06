import client from './client.js';
const BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001';
export const getInvoices = (params) => client.get('/invoices', { params });
export const getInvoice = (id) => client.get(`/invoices/${id}`);
export const createInvoice = (data) => client.post('/invoices', data);
export const getInvoicePdfUrl = (id) => `${BASE}/api/invoices/${id}/pdf`;
export const sendInvoiceWhatsApp = (id) => client.post(`/invoices/${id}/send-whatsapp`);
