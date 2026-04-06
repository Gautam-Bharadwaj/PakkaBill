import client from './client';
import { ENDPOINTS } from '../constants/api';

export const getInvoices = (params) => client.get(ENDPOINTS.INVOICES, { params });
export const getInvoice = (id) => client.get(ENDPOINTS.INVOICE(id));
export const createInvoice = (data) => client.post(ENDPOINTS.INVOICES, data);
export const getInvoicePdfUrl = (id) => `${client.defaults.baseURL}${ENDPOINTS.INVOICE_PDF(id)}`;
export const sendInvoiceWhatsApp = (id) => client.post(ENDPOINTS.INVOICE_WHATSAPP(id));
