import client from './client.js';
export const login = (pin) => client.post('/auth/login', { pin });
export const refresh = (refreshToken) => client.post('/auth/refresh', { refreshToken });
export const logout = () => client.post('/auth/logout');
