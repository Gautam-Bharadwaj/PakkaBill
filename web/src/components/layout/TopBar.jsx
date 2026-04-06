import React from 'react';
import { useLocation } from 'react-router-dom';
import { Bell, Search } from 'lucide-react';
import useAuthStore from '../../store/useAuthStore.js';
import { format } from 'date-fns';

const PAGE_TITLES = {
  '/dashboard': 'Dashboard',
  '/dealers': 'Dealers',
  '/products': 'Products',
  '/invoices': 'Invoices',
  '/invoices/new': 'New Invoice',
  '/payments': 'Payments',
  '/insights': 'ML Insights',
};

export default function TopBar() {
  const location = useLocation();
  const user = useAuthStore((s) => s.user);
  const title = PAGE_TITLES[location.pathname] || 'Billo Billings';

  return (
    <header className="h-16 bg-white border-b border-gray-100 flex items-center justify-between px-6 shadow-sm">
      <div>
        <h1 className="text-lg font-bold text-gray-800">{title}</h1>
        <p className="text-xs text-gray-400">{format(new Date(), 'EEEE, dd MMMM yyyy')}</p>
      </div>
      <div className="flex items-center gap-4">
        <button className="p-2 rounded-lg hover:bg-gray-100 transition-colors relative">
          <Bell className="w-5 h-5 text-gray-500" />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-danger rounded-full" />
        </button>
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
            <span className="text-white text-sm font-bold">
              {user?.name?.charAt(0) || 'A'}
            </span>
          </div>
          <span className="text-sm font-semibold text-gray-700">{user?.name || 'Admin'}</span>
        </div>
      </div>
    </header>
  );
}
