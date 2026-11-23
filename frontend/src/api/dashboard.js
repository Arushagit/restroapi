import api from './axios';

export const getDashboardStats = () => api.get('/dashboard/stats/');
export const getRevenueChart = () => api.get('/dashboard/revenue/');
export const getRecentOrders = () => api.get('/dashboard/recent-orders/');
