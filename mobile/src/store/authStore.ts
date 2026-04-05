import { create } from 'zustand';
import * as Keychain from 'react-native-keychain';
import { api, saveTokens, clearTokens } from '../api/client';

const SERVICE = 'billo.auth';

type State = {
  phone: string | null;
  ready: boolean;
  signedIn: boolean;
  boot: () => Promise<void>;
  login: (phone: string, pin: string) => Promise<void>;
  logout: () => Promise<void>;
};

export const useAuthStore = create<State>((set, get) => ({
  phone: null,
  ready: false,
  signedIn: false,

  boot: async () => {
    const creds = await Keychain.getGenericPassword({ service: SERVICE });
    if (creds) {
      try {
        const parsed = JSON.parse(creds.password);
        if (parsed?.accessToken) {
          set({ signedIn: true, ready: true });
          return;
        }
      } catch {
        /* ignore */
      }
    }
    set({ signedIn: false, ready: true });
  },

  login: async (phone: string, pin: string) => {
    await clearTokens();
    const { data } = await api.post('/auth/login', { phone, pin });
    await saveTokens(data.accessToken, data.refreshToken);
    set({ signedIn: true, phone: data.user?.phone ?? phone });
  },

  logout: async () => {
    try {
      await api.post('/auth/logout');
    } catch {
      /* ignore */
    }
    await clearTokens();
    set({ signedIn: false, phone: null });
  },
}));
