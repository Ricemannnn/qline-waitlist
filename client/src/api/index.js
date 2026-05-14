import axios from 'axios';

const API_BASE_URL = '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // IMPORTANT: Allows sending/receiving httpOnly cookies
});

// Waitlist
export const getWaitlist = (restaurantId) => api.get(`/waitlist/${restaurantId}`);
export const joinWaitlist = (restaurantId, data) => api.post(`/waitlist/${restaurantId}/join`, data);
export const updateWaitlistStatus = (id, status) => api.patch(`/waitlist/status/${id}`, { status });
export const getGuestStatus = (id) => api.get(`/waitlist/guest/${id}`);
export const notifyGuest = (restaurantId, id) => api.post(`/waitlist/${restaurantId}/notify/${id}`);

// Reservations
export const getReservations = (restaurantId) => api.get(`/reservations/${restaurantId}`);
export const addReservation = (restaurantId, data) => api.post(`/reservations/${restaurantId}`, data);
export const updateReservationStatus = (id, status) => api.patch(`/reservations/status/${id}`, { status });

// Settings
export const getSettings = (restaurantId) => api.get(`/settings/${restaurantId}`);
export const updateSettings = (restaurantId, data) => api.post(`/settings/${restaurantId}`, data);

// Tables
export const getTables = (restaurantId) => api.get(`/tables/${restaurantId}`);
export const addTable = (restaurantId, data) => api.post(`/tables/${restaurantId}`, data);
export const updateTable = (id, data) => api.patch(`/tables/${id}`, data);
export const getCloverTables = (merchantId) => api.get(`/clover/tables/${merchantId}`);

// Auth
export const login = (data) => api.post('/auth/login', data);
export const register = (data) => api.post('/auth/register', data);
export const logout = () => api.post('/auth/logout');
export const getMe = () => api.get('/auth/me');

// Clover Status
export const getCloverStatus = (merchantId) => api.get(`/auth/clover/status/${merchantId}`);

export default api;
