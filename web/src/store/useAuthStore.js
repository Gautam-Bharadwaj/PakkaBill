import { create } from 'zustand';
import * as authApi from '../api/auth.api.js';

const useAuthStore = create((set) => ({
  isAuthenticated: false,
  user: null,
  isLoading: false,
  error: null,

  loadFromStorage: () => {
    const token = localStorage.getItem('ntp_access_token');
    const user = JSON.parse(localStorage.getItem('ntp_user') || 'null');
    if (token && user) set({ isAuthenticated: true, user });
  },

  login: async (pin) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await authApi.login(pin);
      const { accessToken, refreshToken, user } = data.data;
      localStorage.setItem('ntp_access_token', accessToken);
      localStorage.setItem('ntp_refresh_token', refreshToken);
      localStorage.setItem('ntp_user', JSON.stringify(user));
      set({ isAuthenticated: true, user, isLoading: false });
    } catch (err) {
      const msg = err.response?.data?.message || 'Invalid PIN';
      set({ error: msg, isLoading: false });
      throw new Error(msg);
    }
  },

  logout: async () => {
    try { await authApi.logout(); } catch { }
    localStorage.removeItem('ntp_access_token');
    localStorage.removeItem('ntp_refresh_token');
    localStorage.removeItem('ntp_user');
    set({ isAuthenticated: false, user: null });
  },
}));

export default useAuthStore;
