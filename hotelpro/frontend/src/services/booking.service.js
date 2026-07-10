import api from './api';

export async function getBookings(params = {}) {
  const response = await api.get('/bookings', { params });
  return response.data.data;
}

export async function getBookingById(id) {
  const response = await api.get(`/bookings/${id}`);
  return response.data.data;
}

export async function createBooking(bookingData) {
  const response = await api.post('/bookings', bookingData);
  return response.data.data;
}

export async function createSelfBooking(bookingData) {
  const response = await api.post('/bookings/self', bookingData);
  return response.data.data;
}

export async function getMyBookings() {
  const response = await api.get('/bookings/my-bookings');
  return response.data.data;
}

export async function updateBookingStatus(id, status) {
  const response = await api.patch(`/bookings/${id}/status`, { status });
  return response.data.data;
}

export async function deleteBooking(id) {
  const response = await api.delete(`/bookings/${id}`);
  return response.data;
}