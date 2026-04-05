import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import * as Keychain from 'react-native-keychain';

const SERVICE = 'billo.auth';

export const API_BASE =
  typeof __DEV__ !== 'undefined' && __DEV__
    ? 'http://10.0.2.2:4000'
    : 'https://api.example.com';

export const api = axios.create({
  baseURL: `${API_BASE}/api`,
  timeout: 20000,
});

async function readTokens(): Promise<{ accessToken: string; refreshToken: string } | null> {
  const creds = await Keychain.getGenericPassword({ service: SERVICE });
  if (!creds) return null;
  try {
    return JSON.parse(creds.password);
  } catch {
    return null;
  }
}

export async function saveTokens(accessToken: string, refreshToken: string) {
  await Keychain.setGenericPassword(
    'session',
    JSON.stringify({ accessToken, refreshToken }),
    { service: SERVICE },
  );
}

export async function clearTokens() {
  await Keychain.resetGenericPassword({ service: SERVICE });
}

api.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
  const t = await readTokens();
  if (t?.accessToken && config.headers) {
    config.headers.Authorization = `Bearer ${t.accessToken}`;
  }
  return config;
});

let refreshPromise: Promise<string | null> | null = null;

async function refreshAccess(): Promise<string | null> {
  const t = await readTokens();
  if (!t?.refreshToken) return null;
  try {
    const { data } = await axios.post(`${API_BASE}/api/auth/refresh`, {
      refreshToken: t.refreshToken,
    });
    await saveTokens(data.accessToken, data.refreshToken);
    return data.accessToken as string;
  } catch {
    await clearTokens();
    return null;
  }
}

api.interceptors.response.use(
  (r) => r,
  async (error: AxiosError) => {
    const original = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
    if (error.response?.status === 401 && original && !original._retry) {
      original._retry = true;
      if (!refreshPromise) refreshPromise = refreshAccess();
      const token = await refreshPromise;
      refreshPromise = null;
      if (token && original.headers) {
        original.headers.Authorization = `Bearer ${token}`;
        return api(original);
      }
    }
    return Promise.reject(error);
  },
);
