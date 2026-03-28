import axios from 'axios';

const API_BASE = '/api/reservations';

export const getReservations = () => axios.get(API_BASE);
export const getReservation = (id) => axios.get(`${API_BASE}/${id}`);
export const addReservation = (data) => axios.post(API_BASE, data);
