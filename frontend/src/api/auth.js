import axios from './axiosInstance';

const API_BASE = '/api/auth';
const ADMIN_API_BASE = '/api/admin-auth';

export const login = (data) => axios.post(`${API_BASE}/login`, data);
export const adminLogin = (data) => axios.post(`${ADMIN_API_BASE}/login`, data);
export const register = (data) => axios.post(`${API_BASE}/register`, data);
export const adminRegister = (data) => axios.post(`${ADMIN_API_BASE}/register`, data);
export const forgotPassword = (data) => axios.post(`${API_BASE}/forgot-password`, data);
export const resetPassword = (data) => axios.post(`${API_BASE}/reset-password`, data);
