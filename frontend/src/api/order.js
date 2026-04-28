import axios from './axiosInstance';

const API_BASE = '/api/orders';

const authConfig = () => {
  const token = localStorage.getItem('token');

  return token
    ? {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    : {};
};

export const getOrders = () => axios.get(API_BASE, authConfig());

export const getOrder = (id) =>
  axios.get(`${API_BASE}/${id}`, authConfig());

export const placeOrder = (data) =>
  axios.post(API_BASE, data, authConfig());

export const updateOrderStatus = (id, data) =>
  axios.patch(`${API_BASE}/${id}/status`, data, authConfig());

export const payOrder = (id, data) =>
  axios.patch(`${API_BASE}/${id}/pay`, data, authConfig());

// export const getOrders = () => axios.get(API_BASE);
// export const getOrder = (id) => axios.get(`${API_BASE}/${id}`);
// export const placeOrder = (data) => axios.post(API_BASE, data);
// export const updateOrderStatus = (id, data) => axios.patch(`${API_BASE}/${id}/status`, data);
// export const payOrder = (id, data) => axios.patch(`${API_BASE}/${id}/pay`, data);
