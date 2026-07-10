import api from './api';

export async function getNotifications(params = {}) {
  const response = await api.get('/notifications', { params });
  return response.data.data;
}

export async function getUnreadCount() {
  const response = await api.get('/notifications/unread-count');
  return response.data.data.count;
}

export async function markNotificationRead(id) {
  const response = await api.patch(`/notifications/${id}/read`);
  return response.data.data;
}

export async function markAllNotificationsRead() {
  const response = await api.patch('/notifications/read-all');
  return response.data;
}