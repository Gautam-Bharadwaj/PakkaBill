import React, { useEffect } from 'react';
import AppRouter from './router/index.jsx';
import useAuthStore from './store/useAuthStore.js';

export default function App() {
  const loadFromStorage = useAuthStore((s) => s.loadFromStorage);

  useEffect(() => {
    loadFromStorage();
  }, []);

  return <AppRouter />;
}
