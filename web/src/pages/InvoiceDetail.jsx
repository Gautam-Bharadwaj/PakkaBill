import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import useInvoiceStore from '../store/useInvoiceStore.js';
import { getPaymentsByInvoice, recordPayment } from '../api/payment.api.js';
import { sendInvoiceWhatsApp, getInvoicePdfUrl } from '../api/invoice.api.js';
import { formatINR } from '../utils/currency.js';
import { formatDate, formatDateTime } from '../utils/date.js';
import { QRCodeSVG } from 'qrcode.react';
import { ArrowLeft, Download, MessageSquare, CreditCard } from 'lucide-react';

const generateUpiLink = ({ vpa, name, amount, note = '' }) => {
  const params = new URLSearchParams({ pa: vpa, pn: name, am: Number(amount).toFixed(2), tn: note.substring(0, 100), cu: 'INR' });
  return `upi://pay?${params.toString()}`;
};

export default function InvoiceDetail() {
  const { id } = useParams();
  const { currentInvoice: invoice, isLoading, fetchInvoice } = useInvoiceStore();
  const [payments, setPayments] = useState([]);
  const [showPayModal, setShowPayModal] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchInvoice(id);
    getPaymentsByInvoice(id).then(({ data }) => setPayments(data.data || [])).catch(() => {});
  }, [id]);

  if (isLoading || !invoice) return <div className="text-center py-12 text-gray-400">Loading invoice…</div>;

  const upiLink = generateUpiLink({ vpa: 'merchant@upi', name: 'Billo Billings', amount: invoice.amountDue, note: invoice.invoiceId });

  return (
    <div className="max-w-4xl mx-auto space-y-5 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-primary transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
        <div className="flex items-center gap-2">
          <a href={getInvoicePdfUrl(id)} target="_blank" rel="noopener noreferrer" className="btn-secondary flex items-center gap-2 text-sm py-2">
            <Download className="w-4 h-4" /> Download PDF
          </a>
          <button onClick={() => sendInvoiceWhatsApp(id)} className="btn-primary flex items-center gap-2 text-sm py-2 bg-green-600 hover:bg-green-700 border-green-600">
            <MessageSquare className="w-4 h-4" /> Send WhatsApp
          </button>
          {invoice.amountDue > 0 && (
            <button onClick={() => setShowPayModal(true)} className="btn-primary flex items-center gap-2 text-sm py-2">
              <CreditCard className="w-4 h-4" /> Record Payment
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Main Invoice */}
        <div className="lg:col-span-2 card">
          {/* Invoice Header */}
          <div className="flex items-start justify-between pb-4 border-b border-gray-100 mb-4">
            <div>
              <h1 className="text-2xl font-extrabold text-gray-900 font-mono">{invoice.invoiceId}</h1>
              <p className="text-sm text-gray-400 mt-0.5">{formatDateTime(invoice.createdAt)}</p>
            </div>
            <span className={invoice.paymentStatus === 'paid' ? 'badge-success' : invoice.paymentStatus === 'partial' ? 'badge-warning' : 'badge-danger'}>
              {invoice.paymentStatus}
            </span>
          </div>

          {/* Dealer */}
          <div className="mb-5">
            <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Bill To</p>
            <p className="font-bold text-gray-900">{invoice.dealerName}</p>
            <p className="text-sm text-gray-500">{invoice.dealerShop}</p>
            <p className="text-sm text-primary mt-0.5">Ph: {invoice.dealerPhone}</p>
          </div>

          {/* Line Items */}
          <table className="w-full mb-4">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left text-xs font-semibold text-gray-400 uppercase pb-2">Item</th>
                <th className="text-center text-xs font-semibold text-gray-400 uppercase pb-2">Qty</th>
                <th className="text-right text-xs font-semibold text-gray-400 uppercase pb-2">Price</th>
                <th className="text-right text-xs font-semibold text-gray-400 uppercase pb-2">Total</th>
              </tr>
            </thead>
            <tbody>
              {invoice.lineItems?.map((item, i) => (
                <tr key={i} className="border-b border-gray-50">
                  <td className="py-3 text-sm font-medium text-gray-800">{item.productName}</td>
                  <td className="py-3 text-sm text-center text-gray-500">{item.quantity}</td>
                  <td className="py-3 text-sm text-right text-gray-600 text-inr">{formatINR(item.unitPrice)}</td>
                  <td className="py-3 text-sm text-right font-semibold text-gray-800 text-inr">{formatINR(item.lineTotal)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Totals */}
          <div className="space-y-1.5 text-sm">
            <div className="flex justify-between"><span className="text-gray-500">Subtotal</span><span>{formatINR(invoice.subtotal)}</span></div>
            {invoice.discountTotal > 0 && <div className="flex justify-between"><span className="text-gray-500">Discount</span><span>−{formatINR(invoice.discountTotal)}</span></div>}
            {invoice.gstRate > 0 && <div className="flex justify-between"><span className="text-gray-500">GST ({invoice.gstRate}%)</span><span>{formatINR(invoice.gstAmount)}</span></div>}
            <div className="flex justify-between font-bold text-base border-t border-gray-100 pt-2 mt-2"><span>Grand Total</span><span className="text-inr">{formatINR(invoice.totalAmount)}</span></div>
            <div className="flex justify-between text-success font-semibold"><span>Amount Paid</span><span className="text-inr">{formatINR(invoice.amountPaid)}</span></div>
            {invoice.amountDue > 0 && <div className="flex justify-between font-extrabold text-danger text-base"><span>Amount Due</span><span className="text-inr">{formatINR(invoice.amountDue)}</span></div>}
            <div className="flex justify-between text-gray-500 pt-1"><span>Profit</span><span className="text-success font-semibold">{formatINR(invoice.totalProfit)}</span></div>
          </div>
        </div>

        {/* Right Panel */}
        <div className="space-y-4">
          {/* QR Code */}
          {invoice.amountDue > 0 && (
            <div className="card text-center">
              <p className="text-sm font-bold text-gray-700 mb-3">UPI Payment QR</p>
              <div className="flex justify-center">
                <QRCodeSVG value={upiLink} size={180} fgColor="#1A237E" />
              </div>
              <p className="text-xs text-gray-400 mt-2">Scan to pay {formatINR(invoice.amountDue)}</p>
            </div>
          )}

          {/* Payment History */}
          <div className="card">
            <p className="text-sm font-bold text-gray-700 mb-3">Payment History</p>
            {payments.length === 0 ? (
              <p className="text-xs text-gray-400 text-center py-3">No payments recorded</p>
            ) : (
              <div className="space-y-2">
                {payments.map((p) => (
                  <div key={p._id} className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-semibold text-gray-800 uppercase">{p.mode}</p>
                      <p className="text-xs text-gray-400">{formatDate(p.createdAt, 'dd MMM hh:mm a')}</p>
                    </div>
                    <span className="text-sm font-bold text-success text-inr">{formatINR(p.amount)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Payment Modal */}
      {showPayModal && (
        <PaymentModal
          invoice={invoice}
          onClose={() => setShowPayModal(false)}
          onSuccess={() => {
            setShowPayModal(false);
            fetchInvoice(id);
            getPaymentsByInvoice(id).then(({ data }) => setPayments(data.data || []));
          }}
        />
      )}
    </div>
  );
}

function PaymentModal({ invoice, onClose, onSuccess }) {
  const [form, setForm] = useState({ amount: String(invoice.amountDue), mode: 'cash', upiRef: '', note: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    const amt = parseFloat(form.amount);
    if (!amt || amt <= 0) { setError('Enter a valid amount'); return; }
    setLoading(true); setError('');
    try {
      await recordPayment({ invoiceId: invoice._id, amount: amt, mode: form.mode, upiReference: form.upiRef, note: form.note });
      onSuccess();
    } catch (err) { setError(err.response?.data?.message || 'Failed'); }
    finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-modal w-full max-w-sm animate-fade-in">
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h3 className="text-lg font-bold">Record Payment</h3>
          <button onClick={onClose} className="text-gray-400 text-2xl">✕</button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div className="bg-danger-light rounded-xl p-3 text-center">
            <p className="text-xs text-danger">Amount Due</p>
            <p className="text-2xl font-extrabold text-danger">{formatINR(invoice.amountDue)}</p>
          </div>
          <div><label className="label">Amount *</label>
            <div className="relative"><span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">₹</span>
              <input className="input pl-7" type="number" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} />
            </div>
          </div>
          <div>
            <label className="label">Mode</label>
            <div className="flex gap-2">
              {['cash', 'upi', 'bank'].map((m) => (
                <button key={m} type="button" onClick={() => setForm({ ...form, mode: m })}
                  className={`flex-1 py-2 rounded-lg text-sm font-semibold border transition-all ${form.mode === m ? 'bg-primary text-white border-primary' : 'bg-white text-gray-600 border-gray-200 hover:border-primary'}`}
                >{m.toUpperCase()}</button>
              ))}
            </div>
          </div>
          {form.mode === 'upi' && (
            <div><label className="label">UPI Reference</label><input className="input" value={form.upiRef} onChange={(e) => setForm({ ...form, upiRef: e.target.value })} placeholder="UTR number" /></div>
          )}
          <div><label className="label">Note</label><input className="input" value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} /></div>
          {error && <p className="text-sm text-danger font-medium">{error}</p>}
          <div className="flex gap-3"><button type="button" onClick={onClose} className="btn-ghost flex-1">Cancel</button>
            <button type="submit" disabled={loading} className="btn-primary flex-1">{loading ? 'Saving...' : 'Record'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
