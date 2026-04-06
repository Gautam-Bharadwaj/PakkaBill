import React, { useEffect, useState } from 'react';
import useProductStore from '../store/useProductStore.js';
import { formatINR } from '../utils/currency.js';
import { Plus, Search, Pencil, Trash2, Package } from 'lucide-react';
import useDebounce from '../hooks/useDebounce.js';

const MARGIN_THRESHOLDS = { LOW: 15, MEDIUM: 25 };

function marginBadge(margin) {
  if (margin >= MARGIN_THRESHOLDS.MEDIUM) return <span className="badge-success">{margin.toFixed(1)}%</span>;
  if (margin >= MARGIN_THRESHOLDS.LOW) return <span className="badge-warning">{margin.toFixed(1)}%</span>;
  return <span className="badge-danger">{margin.toFixed(1)}%</span>;
}

export default function Products() {
  const { products, isLoading, fetchProducts, createProduct, updateProduct, deleteProduct } = useProductStore();
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const debouncedSearch = useDebounce(search, 300);

  useEffect(() => { fetchProducts({ q: debouncedSearch }); }, [debouncedSearch]);

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete "${name}"?`)) return;
    await deleteProduct(id);
  };

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input className="input pl-10" placeholder="Search products..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <button onClick={() => { setEditProduct(null); setShowModal(true); }} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" /> Add Product
        </button>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {isLoading ? <p className="text-gray-400 col-span-full text-center py-10">Loading...</p> :
         products.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-400">No products found</p>
          </div>
        ) : products.map((p) => (
          <div key={p._id} className="card hover:shadow-lg transition-shadow duration-200">
            <div className="flex justify-between items-start mb-3">
              <h3 className="font-bold text-gray-900 text-sm leading-snug">{p.name}</h3>
              {p.stockQuantity <= p.lowStockThreshold && (
                <span className="badge-warning ml-2 flex-shrink-0">Low Stock</span>
              )}
            </div>
            <p className="text-2xl font-extrabold text-primary text-inr mb-3">{formatINR(p.sellingPrice)}</p>
            <div className="space-y-1.5 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Mfg Cost</span>
                <span className="font-semibold text-gray-700">{formatINR(p.manufacturingCost)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-500">Margin</span>
                {marginBadge(p.profitMarginPercent || 0)}
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Stock</span>
                <span className={`font-semibold ${p.stockQuantity <= p.lowStockThreshold ? 'text-warning' : 'text-gray-700'}`}>{p.stockQuantity} units</span>
              </div>
            </div>
            <div className="flex gap-2 mt-4 pt-3 border-t border-gray-100">
              <button onClick={() => { setEditProduct(p); setShowModal(true); }} className="flex-1 btn-secondary text-sm py-2 flex items-center justify-center gap-1.5">
                <Pencil className="w-3.5 h-3.5" /> Edit
              </button>
              <button onClick={() => handleDelete(p._id, p.name)} className="p-2 rounded-lg hover:bg-danger-light text-gray-400 hover:text-danger transition-colors border border-gray-200">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <ProductModal
          product={editProduct}
          onClose={() => setShowModal(false)}
          onSuccess={() => { setShowModal(false); fetchProducts({ q: debouncedSearch }); }}
          createProduct={createProduct}
          updateProduct={updateProduct}
        />
      )}
    </div>
  );
}

function ProductModal({ product, onClose, onSuccess, createProduct, updateProduct }) {
  const [form, setForm] = useState({
    name: product?.name || '',
    sellingPrice: String(product?.sellingPrice || ''),
    paper: String(product?.costBreakdown?.paper || 0),
    printing: String(product?.costBreakdown?.printing || 0),
    binding: String(product?.costBreakdown?.binding || 0),
    other: String(product?.costBreakdown?.other || 0),
    stockQuantity: String(product?.stockQuantity || 0),
    lowStockThreshold: String(product?.lowStockThreshold || 10),
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { sellingPrice, paper, printing, binding, other } = { ...form, ...Object.fromEntries(Object.entries(form).map(([k, v]) => [k, parseFloat(v) || 0])) };
  const mfgCost = (parseFloat(form.paper) || 0) + (parseFloat(form.printing) || 0) + (parseFloat(form.binding) || 0) + (parseFloat(form.other) || 0);
  const sp = parseFloat(form.sellingPrice) || 0;
  const margin = sp > 0 ? ((sp - mfgCost) / sp * 100) : 0;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.sellingPrice) { setError('Name and price are required'); return; }
    setLoading(true); setError('');
    try {
      const payload = {
        name: form.name, sellingPrice: parseFloat(form.sellingPrice),
        costBreakdown: { paper: parseFloat(form.paper) || 0, printing: parseFloat(form.printing) || 0, binding: parseFloat(form.binding) || 0, other: parseFloat(form.other) || 0 },
        stockQuantity: parseInt(form.stockQuantity) || 0,
        lowStockThreshold: parseInt(form.lowStockThreshold) || 10,
      };
      if (product) { await updateProduct(product._id, payload); }
      else { await createProduct(payload); }
      onSuccess();
    } catch (err) { setError(err.response?.data?.message || 'Failed'); }
    finally { setLoading(false); }
  };

  const f = (field) => ({ value: form[field], onChange: (e) => setForm({ ...form, [field]: e.target.value }) });

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-modal w-full max-w-lg max-h-[90vh] flex flex-col animate-fade-in">
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h3 className="text-lg font-bold text-gray-900">{product ? 'Edit' : 'Add'} Product</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl font-light">✕</button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto">
          <div><label className="label">Product Name *</label><input className="input" {...f('name')} /></div>
          <div><label className="label">Selling Price *</label>
            <div className="relative"><span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">₹</span>
              <input className="input pl-7" type="number" step="0.01" {...f('sellingPrice')} />
            </div>
          </div>
          <div className="bg-surface rounded-xl p-4 space-y-3">
            <p className="text-sm font-bold text-gray-700">Cost Breakdown</p>
            <div className="grid grid-cols-2 gap-3">
              {[['paper', 'Paper'], ['printing', 'Printing'], ['binding', 'Binding'], ['other', 'Other']].map(([field, label]) => (
                <div key={field}>
                  <label className="label">{label} Cost</label>
                  <div className="relative"><span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">₹</span>
                    <input className="input pl-7" type="number" step="0.01" {...f(field)} />
                  </div>
                </div>
              ))}
            </div>
            {/* Live Margin */}
            <div className={`flex justify-between items-center p-3 rounded-lg ${margin < MARGIN_THRESHOLDS.LOW ? 'bg-danger-light' : margin < MARGIN_THRESHOLDS.MEDIUM ? 'bg-warning-light' : 'bg-success-light'}`}>
              <span className="text-sm font-semibold text-gray-700">Profit Margin</span>
              <span className={`font-extrabold ${margin < MARGIN_THRESHOLDS.LOW ? 'text-danger' : margin < MARGIN_THRESHOLDS.MEDIUM ? 'text-warning' : 'text-success'}`}>{margin.toFixed(1)}%</span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="label">Stock Qty</label><input className="input" type="number" {...f('stockQuantity')} /></div>
            <div><label className="label">Low Stock Alert</label><input className="input" type="number" {...f('lowStockThreshold')} /></div>
          </div>
          {error && <p className="text-sm text-danger font-medium">{error}</p>}
          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose} className="btn-ghost flex-1">Cancel</button>
            <button type="submit" disabled={loading} className="btn-primary flex-1">{loading ? 'Saving...' : product ? 'Save Changes' : 'Add Product'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
