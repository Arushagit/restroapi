import api from './axios';

export const getPayments = () => api.get('/billing/');
export const createPayment = (data) => api.post('/billing/', data);
export const getInvoice = (paymentId) => api.get(`/billing/${paymentId}/invoice/`);
