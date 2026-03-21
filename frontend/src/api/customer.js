import axios from 'axios';

const API_BASE = '/api/customers';

export const getCustomers = () => axios.get(API_BASE);
export const getCustomer = (id) => axios.get(`${API_BASE}/${id}`);
export const addCustomer = (data) => axios.post(API_BASE, data);
