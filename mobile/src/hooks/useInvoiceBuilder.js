import { useState, useCallback } from 'react';

/**
 * Invoice builder state management hook.
 * Manages line items, GST, payment mode for New Invoice screen.
 */
export default function useInvoiceBuilder() {
  const [dealer, setDealer] = useState(null);
  const [lineItems, setLineItems] = useState([]);
  const [gstRate, setGstRate] = useState(0);
  const [paymentMode, setPaymentMode] = useState('credit');
  const [amountPaid, setAmountPaid] = useState('');

  const addProduct = useCallback((product) => {
    setLineItems((prev) => {
      const existing = prev.find((i) => i.productId === product._id);
      if (existing) {
        return prev.map((i) =>
          i.productId === product._id ? { ...i, quantity: i.quantity + 1, ...recalc({ ...i, quantity: i.quantity + 1 }) } : i
        );
      }
      return [...prev, buildItem(product)];
    });
  }, []);

  const buildItem = (product) => ({
    productId: product._id,
    productName: product.name,
    quantity: 1,
    unitPrice: product.sellingPrice,
    discountPercent: 0,
    lineTotal: product.sellingPrice,
    lineProfit: product.sellingPrice - (product.manufacturingCost || 0),
    manufacturingCost: product.manufacturingCost || 0,
  });

  const recalc = (item) => {
    const discountedPrice = item.unitPrice * (1 - item.discountPercent / 100);
    const lineTotal = parseFloat((discountedPrice * item.quantity).toFixed(2));
    const lineProfit = parseFloat(((discountedPrice - item.manufacturingCost) * item.quantity).toFixed(2));
    return { lineTotal, lineProfit };
  };

  const updateQty = (productId, qty) => {
    setLineItems((prev) =>
      prev.map((i) => i.productId === productId ? { ...i, quantity: qty, ...recalc({ ...i, quantity: qty }) } : i)
    );
  };

  const removeItem = (productId) => {
    setLineItems((prev) => prev.filter((i) => i.productId !== productId));
  };

  const subtotal = lineItems.reduce((sum, i) => sum + i.lineTotal, 0);
  const discountTotal = lineItems.reduce(
    (sum, i) => sum + (i.unitPrice * i.discountPercent / 100 * i.quantity), 0
  );
  const gstAmount = parseFloat((subtotal * gstRate / 100).toFixed(2));
  const totalAmount = parseFloat((subtotal + gstAmount).toFixed(2));
  const totalProfit = lineItems.reduce((sum, i) => sum + i.lineProfit, 0);

  const resolvedAmountPaid = paymentMode === 'full'
    ? totalAmount
    : paymentMode === 'credit'
    ? 0
    : parseFloat(amountPaid) || 0;

  const amountDue = parseFloat((totalAmount - resolvedAmountPaid).toFixed(2));

  const buildPayload = () => ({
    dealerId: dealer?._id,
    lineItems: lineItems.map(({ productId, quantity, unitPrice, discountPercent }) => ({
      productId, quantity, unitPrice, discountPercent,
    })),
    gstRate,
    paymentMode,
    amountPaid: resolvedAmountPaid,
  });

  const reset = () => {
    setDealer(null);
    setLineItems([]);
    setGstRate(0);
    setPaymentMode('credit');
    setAmountPaid('');
  };

  return {
    dealer, setDealer,
    lineItems, addProduct, updateQty, removeItem,
    gstRate, setGstRate,
    paymentMode, setPaymentMode,
    amountPaid, setAmountPaid,
    subtotal, discountTotal, gstAmount, totalAmount, totalProfit,
    resolvedAmountPaid, amountDue,
    buildPayload, reset,
  };
}
