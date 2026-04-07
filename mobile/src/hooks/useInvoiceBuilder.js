import { useState, useCallback } from 'react';
import useProductStore from '../store/useProductStore';
import { calc } from '../utils/currency';

/**
 * Enhanced Invoice builder state management hook.
 * Features: Precision Math, Recently Used tracking, and Industrial Calculation logic.
 */
export default function useInvoiceBuilder() {
  const [dealer, setDealer] = useState(null);
  const [lineItems, setLineItems] = useState([]);
  const [gstRate, setGstRate] = useState(0);
  const [paymentMode, setPaymentMode] = useState('credit');
  const [amountPaid, setAmountPaid] = useState('');
  
  const { markAsUsed } = useProductStore();

  const addProduct = useCallback((product) => {
    markAsUsed(product);

    setLineItems((prev) => {
      const existing = prev.find((i) => i.productId === product._id);
      if (existing) {
        return prev.map((i) =>
          i.productId === product._id 
            ? { ...i, quantity: i.quantity + 1, ...recalc({ ...i, quantity: i.quantity + 1 }) } 
            : i
        );
      }
      return [...prev, buildItem(product)];
    });
  }, [markAsUsed]);

  const buildItem = (product) => {
    const discountedPrice = calc.discount(product.sellingPrice, 0);
    return {
      productId: product._id,
      productName: product.name,
      sku: product.sku || 'N/A',
      quantity: 1,
      unitPrice: product.sellingPrice,
      discountPercent: 0,
      lineTotal: discountedPrice,
      lineProfit: calc.sub(discountedPrice, product.manufacturingCost || 0),
      manufacturingCost: product.manufacturingCost || 0,
    };
  };

  const recalc = (item) => {
    const discountedPrice = calc.discount(item.unitPrice, item.discountPercent);
    const lineTotal = calc.mul(discountedPrice, item.quantity);
    const lineProfit = calc.mul(calc.sub(discountedPrice, item.manufacturingCost), item.quantity);
    return { lineTotal, lineProfit };
  };

  const updateQty = (productId, qty) => {
    if (qty < 0) return; // Prevent negative stock billing
    setLineItems((prev) =>
      prev.map((i) => i.productId === productId ? { ...i, quantity: qty, ...recalc({ ...i, quantity: qty }) } : i)
    );
  };

  const removeItem = (productId) => {
    setLineItems((prev) => prev.filter((i) => i.productId !== productId));
  };

  const subtotal = lineItems.reduce((sum, i) => calc.add(sum, i.lineTotal), 0);
  const gstAmount = calc.percent(subtotal, gstRate);
  const totalAmount = calc.add(subtotal, gstAmount);
  const totalProfit = lineItems.reduce((sum, i) => calc.add(sum, i.lineProfit), 0);

  const resolvedAmountPaid = paymentMode === 'full'
    ? totalAmount
    : paymentMode === 'credit'
    ? 0
    : parseFloat(amountPaid) || 0;

  const amountDue = calc.sub(totalAmount, resolvedAmountPaid);

  const buildPayload = () => ({
    dealerId: dealer?._id,
    lineItems: lineItems.map(({ productId, productName, quantity, unitPrice, discountPercent }) => ({
      productId, productName, quantity, unitPrice, discountPercent,
    })),
    gstRate,
    paymentMode,
    amountPaid: resolvedAmountPaid,
  });

  const setReorderItems = useCallback((items) => {
    setLineItems(items.map(item => ({
      ...item,
      lineTotal: calc.mul(item.unitPrice, item.quantity),
      lineProfit: calc.mul(calc.sub(item.unitPrice, item.manufacturingCost || 0), item.quantity)
    })));
  }, []);

  const reset = () => {
    setDealer(null);
    setLineItems([]);
    setGstRate(0);
    setPaymentMode('credit');
    setAmountPaid('');
  };

  return {
    dealer, setDealer,
    lineItems, addProduct, updateQty, removeItem, setReorderItems,
    gstRate, setGstRate,
    paymentMode, setPaymentMode,
    amountPaid, setAmountPaid,
    subtotal, gstAmount, totalAmount, totalProfit,
    resolvedAmountPaid, amountDue,
    buildPayload, reset,
  };
}
