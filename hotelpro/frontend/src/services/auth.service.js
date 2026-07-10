import api from './api';

export async function registerUser({ fullName, email, phone, password }) {
  const response = await api.post('/auth/register', { fullName, email, phone, password });
  return response.data;
}

export async function loginUser({ email, password }) {
  const response = await api.post('/auth/login', { email, password });
  return response.data;
}

export async function logoutUser() {
  const response = await api.post('/auth/logout');
  return response.data;
}

export async function getCurrentUser() {
  const response = await api.get('/auth/me');
  return response.data;
}

export async function forgotPassword(email) {
  const response = await api.post('/auth/forgot-password', { email });
  return response.data;
}

export async function resetPassword({ token, newPassword }) {
  const response = await api.post('/auth/reset-password', { token, newPassword });
  return response.data;
}

export async function changePassword({ currentPassword, newPassword }) {
  const response = await api.post('/auth/change-password', { currentPassword, newPassword });
  return response.data;
}