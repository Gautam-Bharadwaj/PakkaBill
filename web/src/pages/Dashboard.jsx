import React, { useEffect } from 'react';
import useDashboardStore from '../store/useDashboardStore.js';
import { formatINR } from '../utils/currency.js';
import { formatDate } from '../utils/date.js';
import { TrendingUp, Users, FileText, AlertCircle, RefreshCw } from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import { format, parseISO } from 'date-fns';

function StatCard({ title, value, icon: Icon, color, subtitle }) {
  return (
    <div className="card flex items-start gap-4">
      <div className={`p-3 rounded-xl ${color}`}>
        <Icon className="w-5 h-5 text-white" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-500 mb-0.5">{title}</p>
        <p className="text-2xl font-extrabold text-gray-900 text-inr truncate">{value}</p>
        {subtitle && <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>}
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { summary, revenueChart, topProducts, pendingDealers, isLoading, error, fetchAll } = useDashboardStore();

  useEffect(() => { fetchAll(); }, []);

  const chartData = revenueChart.map((d) => ({
    date: (() => { try { return format(parseISO(d._id), 'MMM d'); } catch { return d._id; } })(),
    Revenue: d.revenue,
    Profit: d.profit,
  }));

  if (isLoading && !summary) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard title="Revenue MTD" value={formatINR(summary?.totalRevenueMTD)} icon={TrendingUp} color="bg-primary" subtitle="Month to date" />
        <StatCard title="Profit MTD" value={formatINR(summary?.totalProfitMTD)} icon={TrendingUp} color="bg-success" subtitle="Month to date" />
        <StatCard title="Pending Amount" value={formatINR(summary?.totalPendingAmount)} icon={AlertCircle} color="bg-danger" subtitle="Total outstanding" />
        <StatCard title="Active Dealers" value={summary?.activeDealers || 0} icon={Users} color="bg-primary-light" subtitle="Active accounts" />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Revenue Chart */}
        <div className="xl:col-span-2 card">
          <h2 className="text-base font-bold text-gray-800 mb-4">Revenue vs Profit (30 days)</h2>
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#1A237E" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#1A237E" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="profGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2E7D32" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#2E7D32" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#9CA3AF' }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#9CA3AF' }} tickLine={false} axisLine={false} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
              <Tooltip formatter={(v, n) => [formatINR(v), n]} contentStyle={{ borderRadius: 10, border: '1px solid #e5e7eb', fontSize: 12 }} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Area type="monotone" dataKey="Revenue" stroke="#1A237E" strokeWidth={2.5} fill="url(#revGrad)" />
              <Area type="monotone" dataKey="Profit" stroke="#2E7D32" strokeWidth={2.5} fill="url(#profGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Top Products */}
        <div className="card">
          <h2 className="text-base font-bold text-gray-800 mb-4">Top Products</h2>
          <div className="space-y-3">
            {topProducts.map((p, i) => (
              <div key={p._id} className="flex items-center gap-3">
                <span className="w-6 h-6 bg-primary-lighter text-primary text-xs font-extrabold rounded-lg flex items-center justify-center flex-shrink-0">
                  {i + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-800 truncate">{p.name}</p>
                  <p className="text-xs text-gray-400">{p.unitsSold} units sold</p>
                </div>
                <span className="text-sm font-bold text-primary text-inr">{formatINR(p.revenue)}</span>
              </div>
            ))}
            {!topProducts.length && <p className="text-sm text-gray-400 text-center py-4">No sales data yet</p>}
          </div>
        </div>
      </div>

      {/* Pending Dealers */}
      <div className="card">
        <h2 className="text-base font-bold text-gray-800 mb-4">Pending Payments</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr>
                <th className="table-head">Dealer</th>
                <th className="table-head">Shop</th>
                <th className="table-head text-right">Pending</th>
                <th className="table-head">Last Invoice</th>
                <th className="table-head text-center">Action</th>
              </tr>
            </thead>
            <tbody>
              {pendingDealers.map((d) => (
                <tr key={d._id} className="hover:bg-surface transition-colors">
                  <td className="table-cell font-semibold">{d.name}</td>
                  <td className="table-cell text-gray-500">{d.shopName}</td>
                  <td className="table-cell text-right font-bold text-danger text-inr">{formatINR(d.pendingAmount)}</td>
                  <td className="table-cell text-gray-400">{formatDate(d.lastInvoiceAt)}</td>
                  <td className="table-cell text-center">
                    <a
                      href={`https://wa.me/91${d.phone}?text=${encodeURIComponent(`Payment reminder for ₹${d.pendingAmount}`)}`}
                      target="_blank" rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-semibold bg-success-light text-success px-3 py-1.5 rounded-lg hover:bg-success hover:text-white transition-colors"
                    >
                      Remind
                    </a>
                  </td>
                </tr>
              ))}
              {!pendingDealers.length && (
                <tr><td colSpan={5} className="table-cell text-center text-gray-400 py-8">All payments cleared!</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
