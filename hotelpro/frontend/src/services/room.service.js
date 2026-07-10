import api from './api';

export async function getRooms(params = {}) {
  const response = await api.get('/rooms', { params });
  return response.data.data;
}

export async function getRoomById(id) {
  const response = await api.get(`/rooms/${id}`);
  return response.data.data;
}

export async function createRoom(roomData) {
  const response = await api.post('/rooms', roomData);
  return response.data.data;
}

export async function updateRoom(id, roomData) {
  const response = await api.put(`/rooms/${id}`, roomData);
  return response.data.data;
}

export async function updateRoomStatus(id, status) {
  const response = await api.patch(`/rooms/${id}/status`, { status });
  return response.data.data;
}

export async function deleteRoom(id) {
  const response = await api.delete(`/rooms/${id}`);
  return response.data;
}

export async function uploadRoomImages(id, files) {
  const formData = new FormData();
  files.forEach((file) => formData.append('images', file));
  const response = await api.post(`/rooms/${id}/images`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data.data;
}

export async function getRoomCategories() {
  const response = await api.get('/room-categories');
  return response.data.data;
}