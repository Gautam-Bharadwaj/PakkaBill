import client from './client.js';
export const recordPayment = (data) => client.post('/payments', data);
export const getPaymentsByInvoice = (invoiceId) => client.get(`/payments/${invoiceId}`);
export const getPaymentQR = (invoiceId) => client.get(`/payments/${invoiceId}/qr`);
