import axios from 'axios';

const API_BASE_URL = '/api'; // Use relative path for production

const api = axios.create({
  baseURL: API_BASE_URL,
});

export const getWaitlist = (restaurantId) => api.get(`/waitlist/${restaurantId}`);
export const joinWaitlist = (restaurantId, data) => api.post(`/waitlist/${restaurantId}/join`, data);
export const updateWaitlistStatus = (id, status) => api.patch(`/waitlist/status/${id}`, { status });
export const notifyGuest = (restaurantId, id) => api.post(`/waitlist/${restaurantId}/notify/${id}`);
export const getReservations = (restaurantId) => api.get(`/reservations/${restaurantId}`);

export default api;
