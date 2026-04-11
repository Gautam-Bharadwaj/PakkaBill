import client from './client';
import { ENDPOINTS } from '../constants/api';
import { getAccessToken } from '../utils/storage';

export const getInvoices = (params) => client.get(ENDPOINTS.INVOICES, { params });
export const getInvoice = (id) => client.get(ENDPOINTS.INVOICE(id));
export const createInvoice = (data) => client.post(ENDPOINTS.INVOICES, data);
export const updateInvoice = (id, data) => client.put(ENDPOINTS.INVOICE(id), data);
export const sendInvoiceWhatsApp = (id) => client.post(ENDPOINTS.INVOICE_WHATSAPP(id));

export const getInvoicePdfUrl = async (id) => {
  const token = await getAccessToken();
  return `${client.defaults.baseURL}${ENDPOINTS.INVOICE_PDF(id)}?token=${token}`;
};
