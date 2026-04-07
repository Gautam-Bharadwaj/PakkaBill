// Modern Industrial Pattern: Dynamic Base URL with fallback
export const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://192.168.142.206:5001/api';

export const ENDPOINTS = {
  // Auth
  SIGNUP: '/auth/signup',
  LOGIN: '/auth/login',
  REFRESH: '/auth/refresh',
  LOGOUT: '/auth/logout',
  UPDATE_PROFILE: '/auth/update-profile',

  // Dealers
  DEALERS: '/dealers',
  DEALER: (id) => `/dealers/${id}`,
  DEALER_INVOICES: (id) => `/dealers/${id}/invoices`,
  DEALER_PAYMENTS: (id) => `/dealers/${id}/payments`,
  DEALER_REMIND: (id) => `/dealers/${id}/remind`,

  // Products
  PRODUCTS: '/products',
  PRODUCT: (id) => `/products/${id}`,

  // Invoices
  INVOICES: '/invoices',
  INVOICE: (id) => `/invoices/${id}`,
  INVOICE_PDF: (id) => `/invoices/${id}/pdf`,
  INVOICE_WHATSAPP: (id) => `/invoices/${id}/send-whatsapp`,

  // Payments
  PAYMENTS: '/payments',
  PAYMENTS_BY_INVOICE: (id) => `/payments/${id}`,
  PAYMENT_QR: (id) => `/payments/${id}/qr`,

  // Dashboard
  DASHBOARD_SUMMARY: '/dashboard/summary',
  DASHBOARD_CHART: '/dashboard/revenue-chart',
  DASHBOARD_TOP_PRODUCTS: '/dashboard/top-products',
  DASHBOARD_PENDING_DEALERS: '/dashboard/pending-dealers',
  DASHBOARD_ML: '/dashboard/ml-insights',
};
