import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || 'https://restroapi-vvei.onrender.com/api';
const api = axios.create({ baseURL: BASE_URL });

// Public endpoints that don't require Authorization header for GET
const PUBLIC_GET_PREFIXES = ['/menu/categories', '/menu/items', '/tables'];

api.interceptors.request.use(config => {
  const isPublicGet = config.method === 'get' && PUBLIC_GET_PREFIXES.some(p => config.url?.startsWith(p));
  if (!isPublicGet) {
    const token = localStorage.getItem('access_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  res => res,
  async err => {
    const originalRequest = err.config;

    if (err.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refresh = localStorage.getItem('refresh_token');

      if (refresh && !originalRequest.url?.includes('/auth/token/refresh/')) {
        try {
          const { data } = await axios.post(`${BASE_URL}/auth/token/refresh/`, { refresh });
          localStorage.setItem('access_token', data.access);
          originalRequest.headers.Authorization = `Bearer ${data.access}`;
          return api(originalRequest);
        } catch {
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          
          const path = window.location.pathname;
          const isProtected = ['/admin', '/staff', '/kitchen', '/orders'].some(p => path.startsWith(p));
          if (isProtected) {
            window.location.href = `/login?redirect=${encodeURIComponent(path)}`;
          }
        }
      } else {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
      }
    }
    return Promise.reject(err);
  }
);

export default api;
