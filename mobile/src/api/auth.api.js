import client from './client';
import { ENDPOINTS } from '../constants/api';

export const requestOtp = (contactNo) => client.post(ENDPOINTS.REQUEST_OTP, { contactNo });
export const resendOtp = (contactNo) => client.post(ENDPOINTS.RESEND_OTP, { contactNo });
export const signup = (name, pin, shopName, contactNo, otpCode) => client.post(ENDPOINTS.SIGNUP, { name, pin, shopName, contactNo, otpCode });
export const login = (name, pin, shopName) => client.post(ENDPOINTS.LOGIN, { name, pin, shopName });
export const refresh = (refreshToken) => client.post(ENDPOINTS.REFRESH, { refreshToken });
export const logout = () => client.post(ENDPOINTS.LOGOUT);
export const updateProfile = (data) => client.put(ENDPOINTS.UPDATE_PROFILE, data);
