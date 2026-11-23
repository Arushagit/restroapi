import api from './axios';

export const getCategories = () => api.get('/menu/categories/');
export const createCategory = (data) => api.post('/menu/categories/', data, { headers: { 'Content-Type': 'multipart/form-data' } });
export const updateCategory = (id, data) => api.patch(`/menu/categories/${id}/`, data, { headers: { 'Content-Type': 'multipart/form-data' } });
export const deleteCategory = (id) => api.delete(`/menu/categories/${id}/`);

export const getFoodItems = (params) => api.get('/menu/items/', { params });
export const getFoodItem = (id) => api.get(`/menu/items/${id}/`);
export const createFoodItem = (data) => api.post('/menu/items/', data, { headers: { 'Content-Type': 'multipart/form-data' } });
export const updateFoodItem = (id, data) => api.patch(`/menu/items/${id}/`, data, { headers: { 'Content-Type': 'multipart/form-data' } });
export const deleteFoodItem = (id) => api.delete(`/menu/items/${id}/`);
export const getFeaturedItems = () => api.get('/menu/items/?is_featured=true');
