import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import useInvoiceStore from '../store/useInvoiceStore.js';
import { formatINR } from '../utils/currency.js';
import { formatDate } from '../utils/date.js';
import { Plus, FileText, Download } from 'lucide-react';
import { getInvoicePdfUrl } from '../api/invoice.api.js';

const STATUS_FILTERS = ['all', 'unpaid', 'partial', 'paid'];

export default function Invoices() {
  const { invoices, isLoading, error, fetchInvoices } = useInvoiceStore();
  const [filter, setFilter] = useState('all');
  const navigate = useNavigate();

  useEffect(() => { fetchInvoices({ status: filter }); }, [filter]);

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="flex gap-2">
          {STATUS_FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold border transition-all duration-200 ${filter === f ? 'bg-primary text-white border-primary' : 'bg-white text-gray-600 border-gray-200 hover:border-primary hover:text-primary'}`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
        <div className="sm:ml-auto">
          <Link to="/invoices/new" className="btn-primary flex items-center gap-2">
            <Plus className="w-4 h-4" /> New Invoice
          </Link>
        </div>
      </div>

      {/* Table */}
      <div className="card p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr>
                <th className="table-head">Invoice ID</th>
                <th className="table-head">Dealer</th>
                <th className="table-head text-right">Total</th>
                <th className="table-head text-right">Due</th>
                <th className="table-head">GST</th>
                <th className="table-head">Status</th>
                <th className="table-head">Date</th>
                <th className="table-head text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={8} className="text-center py-10 text-gray-400">Loading...</td></tr>
              ) : error ? (
                <tr><td colSpan={8} className="text-center py-8 text-danger">{error}</td></tr>
              ) : invoices.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-12">
                    <FileText className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                    <p className="text-gray-400">No invoices found</p>
                  </td>
                </tr>
              ) : invoices.map((inv) => (
                <tr key={inv._id} className="hover:bg-surface cursor-pointer transition-colors" onClick={() => navigate(`/invoices/${inv._id}`)}>
                  <td className="table-cell font-mono text-sm text-primary font-bold">{inv.invoiceId}</td>
                  <td className="table-cell">
                    <p className="font-semibold text-gray-900">{inv.dealerName}</p>
                    <p className="text-xs text-gray-400">{inv.dealerShop}</p>
                  </td>
                  <td className="table-cell text-right font-bold text-inr">{formatINR(inv.totalAmount)}</td>
                  <td className={`table-cell text-right font-bold text-inr ${inv.amountDue > 0 ? 'text-danger' : 'text-success'}`}>{formatINR(inv.amountDue)}</td>
                  <td className="table-cell text-gray-500">{inv.gstRate > 0 ? `${inv.gstRate}%` : '—'}</td>
                  <td className="table-cell">
                    <span className={inv.paymentStatus === 'paid' ? 'badge-success' : inv.paymentStatus === 'partial' ? 'badge-warning' : 'badge-danger'}>{inv.paymentStatus}</span>
                  </td>
                  <td className="table-cell text-gray-400">{formatDate(inv.createdAt)}</td>
                  <td className="table-cell text-center" onClick={(e) => e.stopPropagation()}>
                    <a
                      href={getInvoicePdfUrl(inv._id)}
                      target="_blank" rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs font-semibold bg-primary-lighter text-primary px-2.5 py-1.5 rounded-lg hover:bg-primary hover:text-white transition-colors"
                    >
                      <Download className="w-3.5 h-3.5" /> PDF
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
