import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import useAuthStore from '../store/useAuthStore.js';
import AppLayout from '../components/layout/AppLayout.jsx';
import Login from '../pages/Login.jsx';
import Dashboard from '../pages/Dashboard.jsx';
import Dealers from '../pages/Dealers.jsx';
import DealerProfile from '../pages/DealerProfile.jsx';
import Products from '../pages/Products.jsx';
import Invoices from '../pages/Invoices.jsx';
import InvoiceDetail from '../pages/InvoiceDetail.jsx';
import NewInvoice from '../pages/NewInvoice.jsx';
import Payments from '../pages/Payments.jsx';
import Insights from '../pages/Insights.jsx';

function ProtectedRoute({ children }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  return isAuthenticated ? children : <Navigate to="/login" replace />;
}

export default function AppRouter() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="dealers" element={<Dealers />} />
        <Route path="dealers/:id" element={<DealerProfile />} />
        <Route path="products" element={<Products />} />
        <Route path="invoices" element={<Invoices />} />
        <Route path="invoices/new" element={<NewInvoice />} />
        <Route path="invoices/:id" element={<InvoiceDetail />} />
        <Route path="payments" element={<Payments />} />
        <Route path="insights" element={<Insights />} />
      </Route>
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
