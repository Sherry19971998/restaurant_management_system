import axios from './axiosInstance';

const API_BASE = '/api/restaurants';

export const getRestaurants = () => axios.get(API_BASE);
export const getRestaurant = (id) => axios.get(`${API_BASE}/${id}`);
export const addRestaurant = (data) => axios.post(API_BASE, data);
