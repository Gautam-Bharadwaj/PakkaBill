import client from './client';
import { ENDPOINTS } from '../constants/api';

export const login = (pin) => client.post(ENDPOINTS.LOGIN, { pin });
export const refresh = (refreshToken) => client.post(ENDPOINTS.REFRESH, { refreshToken });
export const logout = () => client.post(ENDPOINTS.LOGOUT);
