import client from './client';
import { ENDPOINTS } from '../constants/api';

export const recordPayment = (data) => client.post(ENDPOINTS.PAYMENTS, data);
export const getPaymentsByInvoice = (invoiceId) => client.get(ENDPOINTS.PAYMENTS_BY_INVOICE(invoiceId));
export const getPaymentQR = (invoiceId) => client.get(ENDPOINTS.PAYMENT_QR(invoiceId));
