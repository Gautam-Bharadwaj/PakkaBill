import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';

const KEYS = {
  ACCESS_TOKEN: 'ntp_access_token',
  REFRESH_TOKEN: 'ntp_refresh_token',
  USER: 'ntp_user',
  HAS_REGISTERED: 'ntp_registered',
};

// ... existing functions ...

export const setRegistered = async () => {
  await AsyncStorage.setItem(KEYS.HAS_REGISTERED, 'true');
};

export const hasRegistered = async () => {
  const val = await AsyncStorage.getItem(KEYS.HAS_REGISTERED);
  return val === 'true';
};

// Secure store for tokens
export const saveTokens = async (accessToken, refreshToken) => {
  await Promise.all([
    SecureStore.setItemAsync(KEYS.ACCESS_TOKEN, accessToken),
    SecureStore.setItemAsync(KEYS.REFRESH_TOKEN, refreshToken),
  ]);
};

export const getAccessToken = () => SecureStore.getItemAsync(KEYS.ACCESS_TOKEN);
export const getRefreshToken = () => SecureStore.getItemAsync(KEYS.REFRESH_TOKEN);

export const clearTokens = async () => {
  await Promise.all([
    SecureStore.deleteItemAsync(KEYS.ACCESS_TOKEN),
    SecureStore.deleteItemAsync(KEYS.REFRESH_TOKEN),
  ]);
};

// AsyncStorage for non-sensitive data
export const saveUser = async (user) => {
  await AsyncStorage.setItem(KEYS.USER, JSON.stringify(user));
};

export const getUser = async () => {
  const raw = await AsyncStorage.getItem(KEYS.USER);
  return raw ? JSON.parse(raw) : null;
};

export const clearAll = async () => {
  await Promise.all([clearTokens(), AsyncStorage.removeItem(KEYS.USER)]);
};
