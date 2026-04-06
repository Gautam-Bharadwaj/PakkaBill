import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../store/useAuthStore.js';
import { BookOpen, Eye, EyeOff } from 'lucide-react';

export default function Login() {
  const [pin, setPin] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [error, setError] = useState('');
  const { login, isLoading } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (pin.length !== 6) { setError('PIN must be exactly 6 digits'); return; }
    setError('');
    try {
      await login(pin);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Invalid PIN');
      setPin('');
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left — Brand panel */}
      <div className="hidden lg:flex w-[42%] bg-primary flex-col items-center justify-center p-12 text-white">
        <div className="w-20 h-20 bg-white/20 rounded-3xl flex items-center justify-center mb-8 shadow-lg">
          <BookOpen className="w-10 h-10 text-white" />
        </div>
        <h1 className="text-4xl font-extrabold mb-3">Billo Billings</h1>
        <p className="text-blue-200 text-lg text-center leading-relaxed max-w-xs">
          Smart billing for notebook wholesale. Track dealers, invoices, and profits — all in one place.
        </p>
        <div className="mt-16 grid grid-cols-2 gap-4 w-full max-w-xs">
          {[
            ['Revenue Tracking'],
            ['PDF Invoices'],
            ['WhatsApp Integration'],
            ['ML Insights'],
          ].map(([label]) => (
            <div key={label} className="bg-white/10 rounded-xl p-4 text-sm font-medium text-center">
              {label}
            </div>
          ))}
        </div>
      </div>

      {/* Right — Login form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-md animate-fade-in">
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <BookOpen className="w-7 h-7 text-primary" />
            <span className="font-bold text-xl text-primary">Billo Billings</span>
          </div>
          <h2 className="text-3xl font-extrabold text-gray-900 mb-2">Welcome Back</h2>
          <p className="text-gray-500 mb-8">Enter your 6-digit PIN to continue</p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="label">PIN</label>
              <div className="relative">
                <input
                  type={showPin ? 'text' : 'password'}
                  value={pin}
                  onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  className="input font-mono text-2xl tracking-[1rem] text-center pr-12"
                  placeholder="••••••"
                  maxLength={6}
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setShowPin(!showPin)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPin ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {error && (
                <p className="mt-1.5 text-sm text-danger font-medium">{error}</p>
              )}
            </div>
            <button
              type="submit"
              disabled={isLoading || pin.length !== 6}
              className="btn-primary w-full py-3 text-base"
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
