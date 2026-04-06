import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import useInvoiceBuilder from '../hooks/useInvoiceBuilder.js';
import useInvoiceStore from '../store/useInvoiceStore.js';
import { getDealers } from '../api/dealer.api.js';
import { getProducts } from '../api/product.api.js';
import { formatINR } from '../utils/currency.js';
import { ArrowLeft, Plus, Trash2, ChevronRight, ChevronLeft } from 'lucide-react';
import useDebounce from '../hooks/useDebounce.js';

const STEPS = ['Select Dealer', 'Add Products', 'Invoice Settings', 'Review & Submit'];
const GST_RATES = [0, 5, 12, 18];

export default function NewInvoice() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const builder = useInvoiceBuilder();
  const { createInvoice } = useInvoiceStore();
  const [step, setStep] = useState(0);
  const [dealers, setDealers] = useState([]);
  const [products, setProducts] = useState([]);
  const [dealerSearch, setDealerSearch] = useState('');
  const [productSearch, setProductSearch] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const debouncedDealer = useDebounce(dealerSearch, 300);
  const debouncedProduct = useDebounce(productSearch, 300);

  useEffect(() => { getDealers({ q: debouncedDealer, limit: 30 }).then(({ data }) => setDealers(data.data || [])); }, [debouncedDealer]);
  useEffect(() => { getProducts({ q: debouncedProduct, limit: 50 }).then(({ data }) => setProducts(data.data || [])); }, [debouncedProduct]);
  
  useEffect(() => {
    const dealerId = searchParams.get('dealerId');
    if (dealerId && dealers.length) {
      const d = dealers.find((x) => x._id === dealerId);
      if (d && !builder.dealer) { builder.setDealer(d); setStep(1); }
    }
  }, [dealers]);

  const handleSubmit = async () => {
    setSubmitting(true); setError('');
    try {
      const inv = await createInvoice(builder.buildPayload());
      builder.reset();
      navigate(`/invoices/${inv._id}`);
    } catch (err) { setError(err.response?.data?.message || 'Failed to create invoice'); }
    finally { setSubmitting(false); }
  };

  const stepContent = () => {
    switch (step) {
      case 0: return (
        <div className="space-y-4">
          <input className="input" placeholder="Search dealer..." value={dealerSearch} onChange={(e) => setDealerSearch(e.target.value)} />
          <div className="space-y-2 max-h-80 overflow-y-auto">
            {dealers.map((d) => (
              <button key={d._id} onClick={() => builder.setDealer(d)}
                className={`w-full text-left p-3.5 rounded-xl border transition-all ${builder.dealer?._id === d._id ? 'border-primary bg-primary-lighter' : 'border-gray-200 bg-white hover:border-primary/50'}`}
              >
                <p className={`font-semibold ${builder.dealer?._id === d._id ? 'text-primary' : 'text-gray-900'}`}>{d.name}</p>
                <p className="text-sm text-gray-500">{d.shopName}</p>
              </button>
            ))}
          </div>
          <button onClick={() => setStep(1)} disabled={!builder.dealer} className="btn-primary w-full flex items-center justify-center gap-2">
            Next <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      );
      case 1: return (
        <div className="space-y-4">
          <input className="input" placeholder="Search products..." value={productSearch} onChange={(e) => setProductSearch(e.target.value)} />
          <div className="max-h-48 overflow-y-auto space-y-2">
            {products.map((p) => (
              <button key={p._id} onClick={() => builder.addProduct(p)}
                className="w-full text-left p-3 rounded-lg border border-gray-200 hover:border-primary/50 hover:bg-primary-lighter/50 transition-all flex items-center justify-between"
              >
                <div><p className="font-semibold text-sm text-gray-900">{p.name}</p>
                  <p className="text-xs text-gray-400">{formatINR(p.sellingPrice)} | Stock: {p.stockQuantity}</p>
                </div>
                <Plus className="w-4 h-4 text-primary flex-shrink-0" />
              </button>
            ))}
          </div>
          {/* Line items */}
          {builder.lineItems.length > 0 && (
            <div className="border border-gray-100 rounded-xl overflow-hidden">
              {builder.lineItems.map((item) => (
                <div key={item.productId} className="flex items-center gap-3 p-3 border-b border-gray-50 last:border-0">
                  <div className="flex-1 min-w-0"><p className="text-sm font-semibold truncate">{item.productName}</p>
                    <p className="text-xs text-gray-400">{formatINR(item.lineTotal)}</p>
                  </div>
                  <div className="flex items-center gap-1 border border-gray-200 rounded-lg">
                    <button onClick={() => builder.updateItem(item.productId, { quantity: Math.max(1, item.quantity - 1) })} className="px-2 py-1 text-gray-500 hover:text-primary">−</button>
                    <span className="w-8 text-center text-sm font-bold">{item.quantity}</span>
                    <button onClick={() => builder.updateItem(item.productId, { quantity: item.quantity + 1 })} className="px-2 py-1 text-gray-500 hover:text-primary">+</button>
                  </div>
                  <button onClick={() => builder.removeItem(item.productId)} className="text-gray-300 hover:text-danger transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
          {builder.lineItems.length > 0 && (
            <p className="text-sm font-bold text-right text-primary">Subtotal: {formatINR(builder.subtotal)}</p>
          )}
          <div className="flex gap-3">
            <button onClick={() => setStep(0)} className="btn-ghost flex-1 flex items-center justify-center gap-2"><ChevronLeft className="w-4 h-4" /> Back</button>
            <button onClick={() => setStep(2)} disabled={builder.lineItems.length === 0} className="btn-primary flex-1 flex items-center justify-center gap-2">Next <ChevronRight className="w-4 h-4" /></button>
          </div>
        </div>
      );
      case 2: return (
        <div className="space-y-4">
          <div>
            <label className="label">GST Rate</label>
            <div className="flex gap-2">
              {GST_RATES.map((rate) => (
                <button key={rate} type="button" onClick={() => builder.setGstRate(rate)}
                  className={`flex-1 py-2.5 rounded-lg text-sm font-bold border transition-all ${builder.gstRate === rate ? 'bg-primary text-white border-primary' : 'bg-white text-gray-600 border-gray-200 hover:border-primary'}`}
                >{rate === 0 ? 'None' : `${rate}%`}</button>
              ))}
            </div>
          </div>
          <div>
            <label className="label">Payment Mode</label>
            <div className="flex gap-2">
              {[['full', 'Full Payment'], ['partial', 'Partial'], ['credit', 'Credit/Due']].map(([val, label]) => (
                <button key={val} type="button" onClick={() => builder.setPaymentMode(val)}
                  className={`flex-1 py-2.5 rounded-lg text-xs font-bold border transition-all ${builder.paymentMode === val ? 'bg-primary text-white border-primary' : 'bg-white text-gray-600 border-gray-200 hover:border-primary'}`}
                >{label}</button>
              ))}
            </div>
          </div>
          {builder.paymentMode === 'partial' && (
            <div><label className="label">Amount Paid</label>
              <div className="relative"><span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">₹</span>
                <input className="input pl-7" type="number" value={builder.amountPaid} onChange={(e) => builder.setAmountPaid(e.target.value)} placeholder={`Max: ${builder.totalAmount}`} />
              </div>
            </div>
          )}
          <div className="flex gap-3">
            <button onClick={() => setStep(1)} className="btn-ghost flex-1"><ChevronLeft className="w-4 h-4 inline" /> Back</button>
            <button onClick={() => setStep(3)} className="btn-primary flex-1">Review <ChevronRight className="w-4 h-4 inline" /></button>
          </div>
        </div>
      );
      case 3: return (
        <div className="space-y-4">
          <div className="card bg-primary-lighter border-primary/20">
            <p className="text-sm font-bold text-primary mb-0.5">{builder.dealer?.name}</p>
            <p className="text-xs text-gray-600">{builder.dealer?.shopName} • {builder.lineItems.length} items</p>
          </div>
          <div className="space-y-1.5 text-sm">
            {[['Subtotal', formatINR(builder.subtotal)], [`GST (${builder.gstRate}%)`, formatINR(builder.gstAmount)], ['Grand Total', formatINR(builder.totalAmount)], ['Amount Paid', formatINR(builder.resolvedAmountPaid)], ['Amount Due', formatINR(builder.amountDue)]].map(([label, val]) => (
              <div key={label} className="flex justify-between"><span className="text-gray-500">{label}</span><span className={`font-bold text-inr ${label === 'Amount Due' && builder.amountDue > 0 ? 'text-danger' : label === 'Amount Paid' ? 'text-success' : 'text-gray-800'}`}>{val}</span></div>
            ))}
          </div>
          {error && <p className="text-sm text-danger font-semibold">{error}</p>}
          <div className="flex gap-3">
            <button onClick={() => setStep(2)} className="btn-ghost flex-1"><ChevronLeft className="w-4 h-4 inline" /> Back</button>
            <button onClick={handleSubmit} disabled={submitting} className="btn-primary flex-1">{submitting ? 'Creating...' : 'Create Invoice ✓'}</button>
          </div>
        </div>
      );
      default: return null;
    }
  };

  return (
    <div className="max-w-lg mx-auto animate-fade-in">
      <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-primary mb-5">
        <ArrowLeft className="w-4 h-4" /> Cancel
      </button>
      <div className="card">
        <h1 className="text-xl font-bold text-gray-900 mb-5">New Invoice</h1>
        {/* Step indicator */}
        <div className="flex gap-1 mb-6">
          {STEPS.map((s, i) => (
            <div key={s} className="flex-1 flex flex-col items-center gap-1">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${i <= step ? 'bg-primary text-white' : 'bg-gray-200 text-gray-400'}`}>{i + 1}</div>
              <span className={`text-xs font-medium hidden sm:block ${i === step ? 'text-primary' : 'text-gray-400'}`}>{s}</span>
            </div>
          ))}
        </div>
        {stepContent()}
      </div>
    </div>
  );
}
