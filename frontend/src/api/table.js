import axios from 'axios';

const API_BASE = '/api/tables';

export const getTables = () => axios.get(API_BASE);
export const getTable = (id) => axios.get(`${API_BASE}/${id}`);
export const addTable = (data) => axios.post(API_BASE, data);
export const updateTableStatus = (id, data) => axios.patch(`${API_BASE}/${id}`, data);
