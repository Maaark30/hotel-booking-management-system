import api from './api';

export async function getPayments(params = {}) {
  const response = await api.get('/payments', { params });
  return response.data.data;
}

export async function createPayment(paymentData) {
  const response = await api.post('/payments', paymentData);
  return response.data.data;
}

export async function createSelfPayment(paymentData) {
  const response = await api.post('/payments/self', paymentData);
  return response.data.data;
}

export async function updatePaymentStatus(id, status) {
  const response = await api.patch(`/payments/${id}/status`, { status });
  return response.data.data;
}