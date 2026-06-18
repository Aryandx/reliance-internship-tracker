import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const original = err.config;
    if (err.response?.status === 401 && !original._retry) {
      original._retry = true;
      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) {
        try {
          const res = await axios.post(`${BASE_URL}/auth/refresh`, { refreshToken });
          const { accessToken } = res.data.data;
          localStorage.setItem('token', accessToken);
          original.headers.Authorization = `Bearer ${accessToken}`;
          return api(original);
        } catch {
          // refresh failed — clear and redirect
        }
      }
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export default api;
