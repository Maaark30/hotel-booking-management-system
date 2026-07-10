import api from './api';

export async function getGuests(params = {}) {
  const response = await api.get('/guests', { params });
  return response.data.data;
}

export async function getGuestById(id) {
  const response = await api.get(`/guests/${id}`);
  return response.data.data;
}

export async function createGuest(guestData) {
  const response = await api.post('/guests', guestData);
  return response.data.data;
}

export async function updateGuest(id, guestData) {
  const response = await api.put(`/guests/${id}`, guestData);
  return response.data.data;
}

export async function deleteGuest(id) {
  const response = await api.delete(`/guests/${id}`);
  return response.data;
}