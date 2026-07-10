import api from './api';

export async function getDashboardSummary() {
  const response = await api.get('/reports/dashboard-summary');
  return response.data.data;
}

export async function getRevenueReport(params = {}) {
  const response = await api.get('/reports/revenue', { params });
  return response.data.data;
}

export async function getBookingReport(params = {}) {
  const response = await api.get('/reports/bookings', { params });
  return response.data.data;
}

export async function getGuestReport(params = {}) {
  const response = await api.get('/reports/guests', { params });
  return response.data.data;
}

export async function getRoomUtilizationReport(params = {}) {
  const response = await api.get('/reports/room-utilization', { params });
  return response.data.data;
}

export async function getTodayStats() {
  const response = await api.get('/reports/today-stats');
  return response.data.data;
}

export async function getUpcomingReservations() {
  const response = await api.get('/reports/upcoming-reservations');
  return response.data.data;
}

export async function getTopRooms() {
  const response = await api.get('/reports/top-rooms');
  return response.data.data;
}