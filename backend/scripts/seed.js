require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../src/models/User.model');
const Dealer = require('../src/models/Dealer.model');
const Product = require('../src/models/Product.model');
const Invoice = require('../src/models/Invoice.model');
const Payment = require('../src/models/Payment.model');

const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/billo';

async function run() {
  await mongoose.connect(uri);
  await Promise.all([
    User.deleteMany({}),
    Dealer.deleteMany({}),
    Product.deleteMany({}),
    Invoice.deleteMany({}),
    Payment.deleteMany({}),
  ]);

  const pinHash = await bcrypt.hash('4242', 12);
  await User.create({ phone: '9876543210', pinHash });

  const dealers = await Dealer.insertMany([
    {
      name: 'Ravi Stationers',
      phone: '9000000001',
      shopName: 'Ravi Books',
      creditLimit: 50000,
      pendingAmount: 0,
      totalPurchased: 0,
      isActive: true,
    },
    {
      name: 'Meera Supplies',
      phone: '9000000002',
      shopName: 'Meera',
      creditLimit: 40000,
      pendingAmount: 0,
      totalPurchased: 0,
      isActive: true,
    },
    {
      name: 'Kumar & Sons',
      phone: '9000000003',
      shopName: 'Kumar',
      creditLimit: 60000,
      pendingAmount: 0,
      totalPurchased: 0,
      isActive: true,
    },
    {
      name: 'City Paper Mart',
      phone: '9000000004',
      shopName: 'CPM',
      creditLimit: 35000,
      pendingAmount: 0,
      totalPurchased: 0,
      isActive: true,
    },
    {
      name: 'Anita Wholesale',
      phone: '9000000005',
      shopName: 'Anita',
      creditLimit: 45000,
      pendingAmount: 0,
      totalPurchased: 0,
      isActive: true,
    },
  ]);

  const products = await Product.insertMany(
    Array.from({ length: 10 }).map((_, i) => {
      const paper = 10 + i;
      const printing = 5 + (i % 3);
      const binding = 8;
      const manufacturingCost = paper + printing + binding;
      const sellingPrice = manufacturingCost * 1.35 + i * 2;
      return {
        name: `Notebook A4 Ruled ${i + 1}`,
        sellingPrice,
        costBreakdown: { paper, printing, binding },
        manufacturingCost,
        stockQuantity: 200 - i * 10,
        lowStockThreshold: 25,
        isArchived: false,
        archived: false,
      };
    })
  );

  const gstRate = 12;
  const invoices = [];

  for (let i = 0; i < 20; i += 1) {
    const dealer = dealers[i % dealers.length];
    const p1 = products[i % products.length];
    const p2 = products[(i + 3) % products.length];
    const qty1 = 5 + (i % 4);
    const qty2 = 3 + (i % 2);
    const unitPrice1 = p1.sellingPrice;
    const unitPrice2 = p2.sellingPrice;
    const discount1 = i % 5 === 0 ? 20 : 0;
    const line1Total = qty1 * unitPrice1 - discount1;
    const line2Total = qty2 * unitPrice2;
    const items = [
      {
        productId: p1._id,
        productSnapshot: {
          name: p1.name,
          sellingPrice: p1.sellingPrice,
          manufacturingCost: p1.manufacturingCost,
        },
        quantity: qty1,
        unitPrice: unitPrice1,
        discount: discount1,
        lineTotal: line1Total,
        lineProfit: line1Total - qty1 * p1.manufacturingCost,
      },
      {
        productId: p2._id,
        productSnapshot: {
          name: p2.name,
          sellingPrice: p2.sellingPrice,
          manufacturingCost: p2.manufacturingCost,
        },
        quantity: qty2,
        unitPrice: unitPrice2,
        discount: 0,
        lineTotal: line2Total,
        lineProfit: line2Total - qty2 * p2.manufacturingCost,
      },
    ];
    const subtotal = items.reduce((s, it) => s + it.lineTotal, 0);
    const discountTotal = items.reduce((s, it) => s + it.discount, 0);
    const gstAmount = (subtotal * gstRate) / 100;
    const totalAmount = subtotal + gstAmount;
    const totalProfit = items.reduce((s, it) => s + it.lineProfit, 0);
    const paymentMode = i % 3;
    let amountPaid = 0;
    let amountDue = totalAmount;
    let paymentStatus = 'unpaid';
    if (paymentMode === 0) {
      amountPaid = totalAmount;
      amountDue = 0;
      paymentStatus = 'paid';
    } else if (paymentMode === 1) {
      amountPaid = totalAmount / 2;
      amountDue = totalAmount - amountPaid;
      paymentStatus = 'partial';
    }

    const invoiceId = `INV-SEED-${String(i + 1).padStart(4, '0')}`;
    const inv = await Invoice.create({
      invoiceId,
      dealerId: dealer._id,
      dealerSnapshot: { name: dealer.name, phone: dealer.phone, shopName: dealer.shopName },
      items,
      subtotal,
      discountTotal,
      gstRate,
      gstAmount,
      totalAmount,
      totalProfit,
      amountPaid,
      amountDue,
      paymentStatus,
    });

    dealer.pendingAmount += amountDue;
    dealer.totalPurchased += totalAmount;
    await dealer.save();

    p1.stockQuantity = Math.max(0, p1.stockQuantity - qty1);
    p2.stockQuantity = Math.max(0, p2.stockQuantity - qty2);
    await p1.save();
    await p2.save();

    if (amountPaid > 0) {
      await Payment.create({
        invoiceId: inv._id,
        dealerId: dealer._id,
        amount: amountPaid,
        mode: i % 2 === 0 ? 'upi' : 'cash',
        upiRef: i % 2 === 0 ? `UPI${i}` : '',
      });
    }

    invoices.push(inv);
  }

  // eslint-disable-next-line no-console
  console.log('Seed complete:', {
    user: '9876543210 / PIN 4242',
    dealers: dealers.length,
    products: products.length,
    invoices: invoices.length,
  });
  await mongoose.disconnect();
}

run().catch((e) => {
  // eslint-disable-next-line no-console
  console.error(e);
  process.exit(1);
});
