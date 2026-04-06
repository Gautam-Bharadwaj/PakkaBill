import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Users, Package, FileText, CreditCard,
  TrendingUp, LogOut, BookOpen,
} from 'lucide-react';
import useAuthStore from '../../store/useAuthStore.js';
import { clsx } from 'clsx';

const NAV_ITEMS = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/dealers', icon: Users, label: 'Dealers' },
  { to: '/products', icon: Package, label: 'Products' },
  { to: '/invoices', icon: FileText, label: 'Invoices' },
  { to: '/payments', icon: CreditCard, label: 'Payments' },
  { to: '/insights', icon: TrendingUp, label: 'ML Insights' },
];

export default function Sidebar() {
  const logout = useAuthStore((s) => s.logout);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <aside className="w-64 min-h-screen bg-primary flex flex-col shadow-xl">
      {/* Logo */}
      <div className="p-6 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center">
            <BookOpen className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-white font-bold text-base leading-tight">Billo Billings</p>
            <p className="text-blue-200 text-xs">Admin Dashboard</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {NAV_ITEMS.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              clsx('sidebar-link', isActive ? 'sidebar-link-active' : 'sidebar-link-inactive')
            }
          >
            <Icon className="w-4.5 h-4.5 flex-shrink-0" />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-white/10">
        <button
          onClick={handleLogout}
          className="sidebar-link sidebar-link-inactive w-full hover:bg-red-500/20 hover:text-red-200"
        >
          <LogOut className="w-4.5 h-4.5" />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}
