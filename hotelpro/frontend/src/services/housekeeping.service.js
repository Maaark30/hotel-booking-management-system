import api from './api';

export async function getHousekeepingRecords(params = {}) {
  const response = await api.get('/housekeeping', { params });
  return response.data.data;
}

export async function updateHousekeepingStatus(roomId, status, notes) {
  const response = await api.patch(`/housekeeping/${roomId}/status`, { status, notes });
  return response.data.data;
}