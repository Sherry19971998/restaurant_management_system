import axios from 'axios';

const API_BASE = '/api/auth';

export const login = (data) => axios.post(`${API_BASE}/login`, data);
export const register = (data) => axios.post(`${API_BASE}/register`, data);
export const forgotPassword = (data) => axios.post(`${API_BASE}/forgot-password`, data);
export const resetPassword = (data) => axios.post(`${API_BASE}/reset-password`, data);
