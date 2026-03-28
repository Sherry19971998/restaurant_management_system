import axios from 'axios';

const API_BASE = '/api/orders';

export const getOrders = () => axios.get(API_BASE);
export const getOrder = (id) => axios.get(`${API_BASE}/${id}`);
export const placeOrder = (data) => axios.post(API_BASE, data);
export const updateOrderStatus = (id, data) => axios.patch(`${API_BASE}/${id}`, data);
export const payOrder = (id, data) => axios.post(`${API_BASE}/${id}/pay`, data);
