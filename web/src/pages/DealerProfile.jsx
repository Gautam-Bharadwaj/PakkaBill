import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import useDealerStore from '../store/useDealerStore.js';
import { getDealerInvoices } from '../api/dealer.api.js';
import { formatINR } from '../utils/currency.js';
import { formatDate } from '../utils/date.js';
import { ArrowLeft, Phone, MessageSquare, FileText, Edit2 } from 'lucide-react';

export default function DealerProfile() {
  const { id } = useParams();
  const { currentDealer: dealer, isLoading, fetchDealer } = useDealerStore();
  const [invoices, setInvoices] = useState([]);
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({});
  const { updateDealer } = useDealerStore();
  const navigate = useNavigate();

  useEffect(() => {
    fetchDealer(id);
    getDealerInvoices(id, { limit: 10 }).then(({ data }) => setInvoices(data.data || [])).catch(() => {});
  }, [id]);

  useEffect(() => {
    if (dealer) setEditForm({ name: dealer.name, shopName: dealer.shopName, creditLimit: String(dealer.creditLimit), address: dealer.address || '' });
  }, [dealer]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    await updateDealer(id, { ...editForm, creditLimit: Number(editForm.creditLimit) });
    setEditing(false);
  };

  const usedPercent = dealer && dealer.creditLimit > 0 ? Math.min(100, (dealer.pendingAmount / dealer.creditLimit) * 100) : 0;
  const creditColor = usedPercent >= 90 ? 'bg-danger' : usedPercent >= 70 ? 'bg-warning' : 'bg-success';

  if (isLoading) return <div className="text-center py-12 text-gray-400">Loading...</div>;
  if (!dealer) return null;

  return (
    <div className="space-y-6 animate-fade-in max-w-5xl mx-auto">
      {/* Back + Header */}
      <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-primary transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back
      </button>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left Info Card */}
        <div className="lg:w-80 space-y-5">
          <div className="card">
            {editing ? (
              <form onSubmit={handleUpdate} className="space-y-3">
                {[['name', 'Name'], ['shopName', 'Shop Name'], ['address', 'Address']].map(([f, l]) => (
                  <div key={f}>
                    <label className="label">{l}</label>
                    <input className="input" value={editForm[f] || ''} onChange={(e) => setEditForm({ ...editForm, [f]: e.target.value })} />
                  </div>
                ))}
                <div>
                  <label className="label">Credit Limit (₹)</label>
                  <input className="input" type="number" value={editForm.creditLimit} onChange={(e) => setEditForm({ ...editForm, creditLimit: e.target.value })} />
                </div>
                <div className="flex gap-2 pt-1">
                  <button type="button" onClick={() => setEditing(false)} className="btn-ghost flex-1 py-2 text-sm">Cancel</button>
                  <button type="submit" className="btn-primary flex-1 py-2 text-sm">Save</button>
                </div>
              </form>
            ) : (
              <>
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">{dealer.name}</h2>
                    <p className="text-sm text-gray-500">{dealer.shopName}</p>
                  </div>
                  <button onClick={() => setEditing(true)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600">
                    <Edit2 className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex gap-2 mb-4">
                  <a href={`tel:${dealer.phone}`} className="btn-ghost flex items-center gap-2 text-sm py-2 px-3 flex-1 justify-center">
                    <Phone className="w-4 h-4" /> {dealer.phone}
                  </a>
                  <a href={`https://wa.me/91${dealer.phone}`} target="_blank" rel="noopener noreferrer" className="btn-primary flex items-center gap-2 text-sm py-2 px-3 flex-1 justify-center">
                    <MessageSquare className="w-4 h-4" /> WhatsApp
                  </a>
                </div>
                {/* Credit Bar */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>Credit Used</span>
                    <span>{usedPercent.toFixed(0)}%</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className={`h-full ${creditColor} rounded-full transition-all duration-500`} style={{ width: `${usedPercent}%` }} />
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-danger font-semibold">{formatINR(dealer.pendingAmount)} used</span>
                    <span className="text-gray-400">of {formatINR(dealer.creditLimit)}</span>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-3">
            {[
              ['Total Purchased', formatINR(dealer.totalPurchased || 0)],
              ['Total Invoices', dealer.invoiceCount || 0],
              ['GST No.', dealer.gstNumber || '—'],
              ['Status', dealer.status || '—'],
            ].map(([label, value]) => (
              <div key={label} className="card">
                <p className="text-xs text-gray-400 mb-0.5">{label}</p>
                <p className="text-sm font-bold text-gray-800 truncate">{value}</p>
              </div>
            ))}
          </div>

          <Link to={`/invoices/new?dealerId=${id}`} className="btn-primary flex items-center gap-2 justify-center w-full">
            <FileText className="w-4 h-4" /> New Invoice
          </Link>
        </div>

        {/* Right — Invoices */}
        <div className="flex-1 card p-0 overflow-hidden">
          <div className="p-5 border-b border-gray-100">
            <h3 className="font-bold text-gray-800">Recent Invoices</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr>
                  <th className="table-head">Invoice ID</th>
                  <th className="table-head text-right">Amount</th>
                  <th className="table-head text-right">Due</th>
                  <th className="table-head">Status</th>
                  <th className="table-head">Date</th>
                </tr>
              </thead>
              <tbody>
                {invoices.length === 0 ? (
                  <tr><td colSpan={5} className="text-center py-8 text-gray-400">No invoices yet</td></tr>
                ) : invoices.map((inv) => (
                  <tr key={inv._id} className="hover:bg-surface transition-colors cursor-pointer" onClick={() => navigate(`/invoices/${inv._id}`)}>
                    <td className="table-cell font-mono text-sm text-primary font-semibold">{inv.invoiceId}</td>
                    <td className="table-cell text-right text-inr font-semibold">{formatINR(inv.totalAmount)}</td>
                    <td className={`table-cell text-right text-inr font-bold ${inv.amountDue > 0 ? 'text-danger' : 'text-success'}`}>{formatINR(inv.amountDue)}</td>
                    <td className="table-cell">
                      <span className={inv.paymentStatus === 'paid' ? 'badge-success' : inv.paymentStatus === 'partial' ? 'badge-warning' : 'badge-danger'}>
                        {inv.paymentStatus}
                      </span>
                    </td>
                    <td className="table-cell text-gray-400">{formatDate(inv.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
