import client from './client';
import { ENDPOINTS } from '../constants/api';

export const signup = (name, pin) => client.post(ENDPOINTS.SIGNUP, { name, pin });
export const login = (pin, name) => client.post(ENDPOINTS.LOGIN, { pin, name });
export const refresh = (refreshToken) => client.post(ENDPOINTS.REFRESH, { refreshToken });
export const logout = () => client.post(ENDPOINTS.LOGOUT);
export const updateProfile = (data) => client.put(ENDPOINTS.UPDATE_PROFILE, data);
