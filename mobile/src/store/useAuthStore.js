import { create } from 'zustand';
import * as authApi from '../api/auth.api';
import { saveTokens, saveUser, getUser, getAccessToken, clearAll } from '../utils/storage';
import logger from '../utils/logger';

const useAuthStore = create((set, get) => ({
  isAuthenticated: false,
  isLoading: false,
  user: null,
  error: null,

  loadFromStorage: async () => {
    try {
      const token = await getAccessToken();
      const user = await getUser();
      if (token && user) {
        set({ isAuthenticated: true, user });
      }
    } catch (err) {
      logger.error('[Auth] loadFromStorage failed', err);
    }
  },

  login: async ({ pin }) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await authApi.login(pin);
      const { accessToken, refreshToken, user } = data.data;
      await saveTokens(accessToken, refreshToken);
      await saveUser(user);
      set({ isAuthenticated: true, user, isLoading: false });
    } catch (err) {
      const msg = err.response?.data?.message || 'Invalid PIN';
      set({ error: msg, isLoading: false });
      throw new Error(msg);
    }
  },

  logout: async () => {
    try {
      await authApi.logout();
    } catch (err) {
      logger.warn('[Auth] Logout API failed', err);
    }
    await clearAll();
    set({ isAuthenticated: false, user: null });
  },
}));

export default useAuthStore;
