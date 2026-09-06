import axios from 'axios';
import { useAuthStore } from '../stores/authStore.js';

export const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080',
  headers: {
    'Content-Type': 'application/json',
  },
});

axiosClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

axiosClient.interceptors.response.use(
  (response) => response.data,
  async (error) => {
    const originalRequest = error.config;
    const status = error.response?.status;
    const auth = useAuthStore.getState();

    if (status === 401 && auth.refreshToken && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const response = await axios.post(
          `${axiosClient.defaults.baseURL}/api/user/refresh`,
          { refreshToken: auth.refreshToken },
        );
        auth.setAuth(response.data.data);
        originalRequest.headers.Authorization = `Bearer ${response.data.data.accessToken}`;
        return axiosClient(originalRequest);
      } catch {
        auth.clearAuth();
      }
    }

    return Promise.reject(error.response?.data || error);
  },
);
