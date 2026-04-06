import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import useDealerStore from '../store/useDealerStore.js';
import { formatINR } from '../utils/currency.js';
import { formatDate } from '../utils/date.js';
import { Plus, Search, Trash2, Eye } from 'lucide-react';
import useDebounce from '../hooks/useDebounce.js';

const STATUS_BADGE = {
  active: 'badge-success',
  blocked: 'badge-danger',
};

const FILTERS = ['all', 'active', 'blocked'];

export default function Dealers() {
  const { dealers, isLoading, error, fetchDealers, deleteDealer } = useDealerStore();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();
  const debouncedSearch = useDebounce(search, 300);

  useEffect(() => { fetchDealers({ q: debouncedSearch, status: filter }); }, [debouncedSearch, filter]);

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete "${name}"? This cannot be undone.`)) return;
    await deleteDealer(id);
  };

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input className="input pl-10" placeholder="Search dealers..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <div className="flex gap-2">
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold border transition-all duration-200 ${filter === f ? 'bg-primary text-white border-primary' : 'bg-white text-gray-600 border-gray-200 hover:border-primary hover:text-primary'}`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
        <button onClick={() => setShowModal(true)} className="btn-primary flex items-center gap-2 whitespace-nowrap">
          <Plus className="w-4 h-4" /> Add Dealer
        </button>
      </div>

      {/* Table */}
      <div className="card p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr>
                <th className="table-head">Dealer</th>
                <th className="table-head">Phone</th>
                <th className="table-head text-right">Pending</th>
                <th className="table-head text-right">Credit Limit</th>
                <th className="table-head">Status</th>
                <th className="table-head text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={6} className="text-center py-10 text-gray-400">Loading...</td></tr>
              ) : error ? (
                <tr><td colSpan={6} className="text-center py-10 text-danger">{error}</td></tr>
              ) : dealers.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-12 text-gray-400">No dealers found</td></tr>
              ) : dealers.map((d) => (
                <tr key={d._id} className="hover:bg-surface transition-colors">
                  <td className="table-cell">
                    <p className="font-semibold text-gray-900">{d.name}</p>
                    <p className="text-xs text-gray-400">{d.shopName}</p>
                  </td>
                  <td className="table-cell text-gray-600 font-mono text-sm">{d.phone}</td>
                  <td className={`table-cell text-right font-bold text-inr ${d.pendingAmount > 0 ? 'text-danger' : 'text-success'}`}>
                    {formatINR(d.pendingAmount)}
                  </td>
                  <td className="table-cell text-right text-gray-600 text-inr">{formatINR(d.creditLimit)}</td>
                  <td className="table-cell">
                    <span className={STATUS_BADGE[d.status] || 'badge-muted'}>{d.status}</span>
                  </td>
                  <td className="table-cell text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => navigate(`/dealers/${d._id}`)}
                        className="p-1.5 rounded-lg hover:bg-primary-lighter text-gray-500 hover:text-primary transition-colors"
                        title="View Profile"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(d._id, d.name)}
                        className="p-1.5 rounded-lg hover:bg-danger-light text-gray-500 hover:text-danger transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Dealer Modal */}
      {showModal && <AddDealerModal onClose={() => setShowModal(false)} onSuccess={() => { setShowModal(false); fetchDealers({ q: debouncedSearch, status: filter }); }} />}
    </div>
  );
}

function AddDealerModal({ onClose, onSuccess }) {
  const { createDealer } = useDealerStore();
  const [form, setForm] = useState({ name: '', phone: '', shopName: '', creditLimit: '0', address: '', gstNumber: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.phone || !form.shopName) { setError('Name, phone, and shop name are required'); return; }
    if (!/^\d{10}$/.test(form.phone)) { setError('Phone must be 10 digits'); return; }
    setLoading(true); setError('');
    try {
      await createDealer({ ...form, creditLimit: Number(form.creditLimit) });
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add dealer');
    } finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-modal w-full max-w-md animate-fade-in">
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h3 className="text-lg font-bold text-gray-900">Add Dealer</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl font-light">✕</button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {[['name', 'Dealer Name *'], ['phone', 'Phone (10 digits) *'], ['shopName', 'Shop Name *']].map(([field, label]) => (
            <div key={field}>
              <label className="label">{label}</label>
              <input className="input" value={form[field]} onChange={(e) => setForm({ ...form, [field]: e.target.value })} />
            </div>
          ))}
          <div>
            <label className="label">Credit Limit</label>
            <div className="relative"><span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">₹</span>
              <input className="input pl-7" type="number" value={form.creditLimit} onChange={(e) => setForm({ ...form, creditLimit: e.target.value })} />
            </div>
          </div>
          <div>
            <label className="label">Address (optional)</label>
            <textarea className="input resize-none" rows={2} value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
          </div>
          {error && <p className="text-sm text-danger font-medium">{error}</p>}
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-ghost flex-1">Cancel</button>
            <button type="submit" disabled={loading} className="btn-primary flex-1">{loading ? 'Adding...' : 'Add Dealer'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
