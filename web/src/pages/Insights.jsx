import React, { useEffect } from 'react';
import useDashboardStore from '../store/useDashboardStore.js';
import { formatINR } from '../utils/currency.js';
import { RefreshCw } from 'lucide-react';

export default function Insights() {
  const { mlInsights, fetchMlInsights, isLoading } = useDashboardStore();

  useEffect(() => { fetchMlInsights(); }, []);

  if (isLoading && !mlInsights) {
    return <div className="flex items-center justify-center h-64"><RefreshCw className="w-8 h-8 text-primary animate-spin" /></div>;
  }

  const { demand = [], segments = {}, pricing = [], margins = [] } = mlInsights || {};

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Demand Predictions */}
        <div className="card">
          <h2 className="text-base font-bold text-gray-800 mb-4">Demand Predictions</h2>
          {demand.length === 0 ? <p className="text-gray-400 text-sm text-center py-6">No predictions available</p> :
          <div className="space-y-4">
            {demand.map((d, i) => (
              <div key={i}>
                <div className="flex justify-between items-center mb-1.5">
                  <p className="text-sm font-semibold text-gray-800">{d.product}</p>
                  <span className="text-xs font-bold text-primary badge-primary">{d.expectedUnits} units</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-success rounded-full transition-all" style={{ width: `${(d.confidence || 0) * 100}%` }} />
                </div>
                <p className="text-xs text-gray-400 mt-0.5 text-right">{((d.confidence || 0) * 100).toFixed(0)}% confidence</p>
              </div>
            ))}
          </div>}
        </div>

        {/* Dealer Segments */}
        <div className="card">
          <h2 className="text-base font-bold text-gray-800 mb-4">Dealer Segments</h2>
          <div className="space-y-4">
            {[['highValue', 'High Value', 'success'], ['atRisk', 'At Risk', 'warning'], ['dormant', 'Dormant', 'muted']].map(([key, label, variant]) => (
              <div key={key}>
                <p className={`text-sm font-bold mb-2 ${variant === 'success' ? 'text-success' : variant === 'warning' ? 'text-warning' : 'text-gray-500'}`}>{label}</p>
                <div className="flex flex-wrap gap-1.5">
                  {(segments[key] || []).length === 0 ? <span className="text-xs text-gray-400">None</span> :
                  (segments[key] || []).map((name) => (
                    <span key={name} className="badge-muted">{name}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Pricing Suggestions */}
        <div className="card">
          <h2 className="text-base font-bold text-gray-800 mb-4">Pricing Suggestions</h2>
          {pricing.length === 0 ? <p className="text-gray-400 text-sm text-center py-6">No suggestions</p> :
          <div className="space-y-3">
            {pricing.map((p, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-surface rounded-xl">
                <div>
                  <p className="text-sm font-semibold text-gray-800">{p.product}</p>
                  <p className="text-xs text-gray-400">{p.currentMargin}% → {p.expectedMargin}% margin</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-400 line-through">{formatINR(p.currentPrice)}</p>
                  <p className="text-base font-extrabold text-success">{formatINR(p.suggestedPrice)}</p>
                </div>
              </div>
            ))}
          </div>}
        </div>

        {/* Low Margin Alerts */}
        <div className="card">
          <h2 className="text-base font-bold text-gray-800 mb-4">Low Margin Alerts</h2>
          {margins.length === 0 ? <p className="text-gray-400 text-sm text-center py-6">All products are healthy</p> :
          <div className="space-y-2">
            {margins.map((m, i) => (
              <div key={i} className="flex items-center gap-3 p-3 bg-danger-light rounded-xl border-l-4 border-danger">
                <div className="flex-1">
                  <p className="text-sm font-bold text-danger">{m.product}</p>
                  <p className="text-xs text-red-400">{m.marginPercent}% — below {m.threshold}% target</p>
                </div>
                <span className="badge-danger">{m.marginPercent}%</span>
              </div>
            ))}
          </div>}
        </div>
      </div>
    </div>
  );
}
