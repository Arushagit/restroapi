import api from './axios';

export const login = (credentials) => api.post('/auth/login/', credentials);
export const register = (data) => api.post('/auth/register/', data);
export const logout = () => api.post('/auth/logout/');
export const getProfile = () => api.get('/auth/profile/');
export const refreshToken = (refresh) => api.post('/auth/token/refresh/', { refresh });
