import React, { useEffect, useState } from 'react';
import { getInvoices } from '../api/invoice.api.js';
import { getPaymentsByInvoice, recordPayment } from '../api/payment.api.js';
import { formatINR } from '../utils/currency.js';
import { formatDate } from '../utils/date.js';
import { CreditCard } from 'lucide-react';

export default function Payments() {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeInvoice, setActiveInvoice] = useState(null);

  useEffect(() => {
    (async () => {
      const { data } = await getInvoices({ status: 'unpaid,partial', limit: 50 });
      setInvoices(data.data || []);
      setLoading(false);
    })();
  }, []);

  const totalPending = invoices.reduce((s, i) => s + (i.amountDue || 0), 0);

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Summary */}
      <div className="card bg-gradient-to-r from-danger to-red-600 text-white">
        <p className="text-sm font-medium text-red-100">Total Outstanding Payments</p>
        <p className="text-4xl font-extrabold mt-1 text-inr">{formatINR(totalPending)}</p>
        <p className="text-sm text-red-200 mt-1">{invoices.length} invoice(s) pending</p>
      </div>

      {/* Table */}
      <div className="card p-0 overflow-hidden">
        <div className="p-5 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-bold text-gray-800">Outstanding Invoices</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr>
                <th className="table-head">Invoice</th>
                <th className="table-head">Dealer</th>
                <th className="table-head text-right">Total</th>
                <th className="table-head text-right">Due</th>
                <th className="table-head">Status</th>
                <th className="table-head">Date</th>
                <th className="table-head text-center">Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? <tr><td colSpan={7} className="text-center py-8 text-gray-400">Loading...</td></tr>
               : invoices.length === 0 ? <tr><td colSpan={7} className="text-center py-10 text-gray-400">All invoices are paid!</td></tr>
               : invoices.map((inv) => (
                <tr key={inv._id} className="hover:bg-surface transition-colors">
                  <td className="table-cell font-mono text-sm text-primary font-bold">{inv.invoiceId}</td>
                  <td className="table-cell">
                    <p className="font-semibold">{inv.dealerName}</p>
                    <p className="text-xs text-gray-400">{inv.dealerShop}</p>
                  </td>
                  <td className="table-cell text-right text-inr font-semibold">{formatINR(inv.totalAmount)}</td>
                  <td className="table-cell text-right font-bold text-danger text-inr">{formatINR(inv.amountDue)}</td>
                  <td className="table-cell">
                    <span className={inv.paymentStatus === 'partial' ? 'badge-warning' : 'badge-danger'}>{inv.paymentStatus}</span>
                  </td>
                  <td className="table-cell text-gray-400">{formatDate(inv.createdAt)}</td>
                  <td className="table-cell text-center">
                    <button
                      onClick={() => setActiveInvoice(inv)}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold bg-primary-lighter text-primary px-3 py-1.5 rounded-lg hover:bg-primary hover:text-white transition-colors"
                    >
                      <CreditCard className="w-3.5 h-3.5" /> Record
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick Payment Modal */}
      {activeInvoice && (
        <QuickPayModal
          invoice={activeInvoice}
          onClose={() => setActiveInvoice(null)}
          onSuccess={() => {
            setActiveInvoice(null);
            getInvoices({ status: 'unpaid,partial', limit: 50 }).then(({ data }) => setInvoices(data.data || []));
          }}
        />
      )}
    </div>
  );
}

function QuickPayModal({ invoice, onClose, onSuccess }) {
  const [amount, setAmount] = useState(String(invoice.amountDue));
  const [mode, setMode] = useState('cash');
  const [upiRef, setUpiRef] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    const amt = parseFloat(amount);
    if (!amt || amt <= 0) { setError('Valid amount required'); return; }
    setLoading(true);
    try {
      await recordPayment({ invoiceId: invoice._id, amount: amt, mode, upiReference: upiRef });
      onSuccess();
    } catch (err) { setError(err.response?.data?.message || 'Failed'); }
    finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-modal w-full max-w-sm animate-fade-in">
        <div className="flex items-center justify-between p-5 border-b">
          <h3 className="font-bold text-lg">Quick Payment</h3>
          <button onClick={onClose} className="text-gray-400 text-2xl">✕</button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div className="bg-danger-light rounded-xl p-3 text-center">
            <p className="text-xs text-danger">{invoice.invoiceId} — Due</p>
            <p className="text-2xl font-extrabold text-danger">{formatINR(invoice.amountDue)}</p>
          </div>
          <div><label className="label">Amount</label>
            <div className="relative"><span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">₹</span>
              <input className="input pl-7" type="number" value={amount} onChange={(e) => setAmount(e.target.value)} />
            </div>
          </div>
          <div>
            <label className="label">Mode</label>
            <div className="flex gap-2">
              {['cash', 'upi', 'bank'].map((m) => (
                <button key={m} type="button" onClick={() => setMode(m)}
                  className={`flex-1 py-2 rounded-lg text-sm font-bold border ${mode === m ? 'bg-primary text-white border-primary' : 'bg-white text-gray-600 border-gray-200 hover:border-primary'}`}
                >{m.toUpperCase()}</button>
              ))}
            </div>
          </div>
          {mode === 'upi' && <div><label className="label">UTR Reference</label><input className="input" value={upiRef} onChange={(e) => setUpiRef(e.target.value)} /></div>}
          {error && <p className="text-sm text-danger">{error}</p>}
          <div className="flex gap-3">
            <button type="button" onClick={onClose} className="btn-ghost flex-1">Cancel</button>
            <button type="submit" disabled={loading} className="btn-primary flex-1">{loading ? 'Saving...' : 'Record Payment'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
