import { create } from 'zustand';
import * as authApi from '../api/auth.api';
import { saveTokens, saveUser, getUser, getAccessToken, clearAll, setRegistered, hasRegistered } from '../utils/storage';
import logger from '../utils/logger';

const useAuthStore = create((set, get) => ({
  isAuthenticated: false,
  hasRegistered: false,
  isLoading: false,
  user: null,
  error: null,

  loadFromStorage: async () => {
    try {
      const [token, user, registered] = await Promise.all([
        getAccessToken(),
        getUser(),
        hasRegistered(),
      ]);
      set({ isAuthenticated: !!(token && user), user, hasRegistered: registered });
    } catch (err) {
      logger.error('[Auth] loadFromStorage failed', err);
    }
  },

  signup: async ({ name, pin }) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await authApi.signup(name, pin);
      const { accessToken, refreshToken, user } = data.data;
      await Promise.all([saveTokens(accessToken, refreshToken), saveUser(user), setRegistered()]);
      set({ isAuthenticated: true, user, hasRegistered: true, isLoading: false });
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Signup failed';
      set({ error: msg, isLoading: false });
      throw new Error(msg);
    }
  },

  login: async ({ pin, name }) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await authApi.login(pin, name);
      const { accessToken, refreshToken, user } = data.data;
      await Promise.all([saveTokens(accessToken, refreshToken), saveUser(user), setRegistered()]);
      set({ isAuthenticated: true, user, hasRegistered: true, isLoading: false });
    } catch (err) {
      let msg = 'Invalid PIN';
      if (err.response?.data?.message) {
        msg = err.response.data.message;
      } else if (err.request) {
        msg = 'Connection failed. Please check your network or API IP.';
      } else {
        msg = err.message || 'Something went wrong';
      }
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
  
  updateProfile: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const response = await authApi.updateProfile(data);
      const updatedUser = response.data.data;
      await saveUser(updatedUser);
      set({ user: updatedUser, isLoading: false });
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Profile update failed';
      set({ error: msg, isLoading: false });
      throw new Error(msg);
    }
  },
}));

export default useAuthStore;
