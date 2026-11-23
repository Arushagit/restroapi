import api from './axios';

export const getOrders = (params) => api.get('/orders/', { params });
export const getOrder = (id) => api.get(`/orders/${id}/`);
export const createOrder = (data) => api.post('/orders/', data);
export const updateOrderStatus = (id, status, note = '') => api.post(`/orders/${id}/update_status/`, { status, note });
export const getMyOrders = () => api.get('/orders/my_orders/');
export const getKitchenOrders = () => api.get('/orders/kitchen/');
export const cancelOrder = (id, note = 'Cancelled by user') => api.post(`/orders/${id}/update_status/`, { status: 'cancelled', note });
