import { axiosClient } from './axiosClient.js';

export const authApi = {
  register: (payload) => axiosClient.post('/api/user/register', payload),
  registerVerify: (payload) => axiosClient.post('/api/user/register/verify-otp', payload),
  login: (payload) => axiosClient.post('/api/user/login', payload),
  forgotPassword: (payload) => axiosClient.post('/api/user/forgot-password', payload),
  verifyOtp: (payload) => axiosClient.post('/api/user/verify-otp', payload),
  resetPassword: (payload) => axiosClient.post('/api/user/reset-password', payload),
  logout: (payload) => axiosClient.post('/api/user/logout', payload),
  profile: () => axiosClient.get('/api/user/profile'),
};
