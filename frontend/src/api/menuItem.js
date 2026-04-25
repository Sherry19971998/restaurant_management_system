import axios from './axiosInstance';

const API_BASE = '/api/menu-items';

export const getMenuItems = () => axios.get(API_BASE);
export const getMenuItem = (id) => axios.get(`${API_BASE}/${id}`);
export const addMenuItem = (data) => axios.post(API_BASE, data);
export const editMenuItem = (id, data) => axios.patch(`${API_BASE}/update/${id}`, data);
export const deleteMenuItem = (id) => axios.delete(`/api/menu-items/${id}`);