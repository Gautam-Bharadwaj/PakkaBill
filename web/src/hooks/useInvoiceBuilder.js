import { useState } from 'react';

export default function useInvoiceBuilder() {
  const [dealer, setDealer] = useState(null);
  const [lineItems, setLineItems] = useState([]);
  const [gstRate, setGstRate] = useState(0);
  const [paymentMode, setPaymentMode] = useState('credit');
  const [amountPaid, setAmountPaid] = useState('');

  const addProduct = (product) => {
    setLineItems((prev) => {
      const existing = prev.find((i) => i.productId === product._id);
      if (existing) {
        return prev.map((i) => i.productId === product._id ? recalcItem({ ...i, quantity: i.quantity + 1 }) : i);
      }
      return [...prev, buildItem(product)];
    });
  };

  const buildItem = (p) => recalcItem({
    productId: p._id, productName: p.name, quantity: 1,
    unitPrice: p.sellingPrice, discountPercent: 0,
    manufacturingCost: p.manufacturingCost || 0,
  });

  const recalcItem = (item) => {
    const dp = item.unitPrice * (1 - item.discountPercent / 100);
    const lineTotal = parseFloat((dp * item.quantity).toFixed(2));
    const lineProfit = parseFloat(((dp - item.manufacturingCost) * item.quantity).toFixed(2));
    return { ...item, lineTotal, lineProfit };
  };

  const updateItem = (productId, changes) =>
    setLineItems((prev) => prev.map((i) => i.productId === productId ? recalcItem({ ...i, ...changes }) : i));

  const removeItem = (productId) => setLineItems((prev) => prev.filter((i) => i.productId !== productId));

  const subtotal = lineItems.reduce((s, i) => s + i.lineTotal, 0);
  const discountTotal = lineItems.reduce((s, i) => s + i.unitPrice * i.discountPercent / 100 * i.quantity, 0);
  const gstAmount = parseFloat((subtotal * gstRate / 100).toFixed(2));
  const totalAmount = parseFloat((subtotal + gstAmount).toFixed(2));
  const totalProfit = lineItems.reduce((s, i) => s + i.lineProfit, 0);
  const resolvedAmountPaid = paymentMode === 'full' ? totalAmount : paymentMode === 'credit' ? 0 : parseFloat(amountPaid) || 0;
  const amountDue = parseFloat((totalAmount - resolvedAmountPaid).toFixed(2));

  const buildPayload = () => ({
    dealerId: dealer?._id,
    lineItems: lineItems.map(({ productId, quantity, unitPrice, discountPercent }) => ({ productId, quantity, unitPrice, discountPercent })),
    gstRate, paymentMode, amountPaid: resolvedAmountPaid,
  });

  const reset = () => {
    setDealer(null); setLineItems([]); setGstRate(0); setPaymentMode('credit'); setAmountPaid('');
  };

  return { dealer, setDealer, lineItems, addProduct, updateItem, removeItem, gstRate, setGstRate, paymentMode, setPaymentMode, amountPaid, setAmountPaid, subtotal, discountTotal, gstAmount, totalAmount, totalProfit, resolvedAmountPaid, amountDue, buildPayload, reset };
}
