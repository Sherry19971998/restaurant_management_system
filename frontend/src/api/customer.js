import axiosInstance from './axiosInstance';
import axios from 'axios';

const API_BASE = '/api/customers';

export const getCustomers = () => axiosInstance.get(API_BASE);
export const getCustomer = (id) => axiosInstance.get(`${API_BASE}/${id}`);

// 通过手机号查找客户
export const getCustomerByPhone = (phone) => axiosInstance.get(`${API_BASE}?phone=${encodeURIComponent(phone)}`);
// addCustomer 不带 token，直接用原生 axios
export const addCustomer = (data) => axios.post(API_BASE, data);
