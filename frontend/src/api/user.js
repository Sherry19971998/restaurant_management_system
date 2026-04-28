import axios from './axiosInstance';

export const getProfile = () => axios.get('/api/auth/profile');
