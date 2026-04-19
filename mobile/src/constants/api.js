// Modern Industrial Pattern: Dynamic Base URL with fallback
export const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://10.254.202.99:5001/api';

export const ENDPOINTS = {
  // Auth
  SIGNUP: '/auth/signup',
  LOGIN: '/auth/login',
  REFRESH: '/auth/refresh',
  LOGOUT: '/auth/logout',
  UPDATE_PROFILE: '/auth/update-profile',
  REQUEST_OTP: '/auth/request-otp',
  RESEND_OTP: '/auth/resend-otp',

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
  PAYMENT: (id) => `/payments/${id}`,
  PAYMENTS_BY_INVOICE: (id) => `/payments/${id}`,
  PAYMENT_QR: (id) => `/payments/${id}/qr`,

  // Dashboard
  DASHBOARD_SUMMARY: '/dashboard/summary',
  DASHBOARD_CHART: '/dashboard/revenue-chart',
  DASHBOARD_TOP_PRODUCTS: '/dashboard/top-products',
  DASHBOARD_PENDING_DEALERS: '/dashboard/pending-dealers',
  DASHBOARD_ML: '/dashboard/ml-insights',

  // AI & Smart Features
  AI_GST_SUGGESTION: '/ai/gst-suggestion',
  AI_INSIGHTS: '/ai/insights',
  AI_CHAT: '/ai/chat',
};
