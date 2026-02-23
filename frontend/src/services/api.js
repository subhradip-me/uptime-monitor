import axios from 'axios';

// Use environment variable or default to development URL
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle auth errors and extract data
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('authToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  getMe: () => api.get('/auth/me'),
};

export const targetsAPI = {
  getAll: () => api.get('/targets'),
  get: (id) => api.get(`/targets/${id}`),
  create: (target) => api.post('/targets', target),
  update: (id, target) => api.put(`/targets/${id}`, target),
  delete: (id) => api.delete(`/targets/${id}`),
  ping: (id) => api.post(`/targets/${id}/ping`),
  pause: (id) => api.post(`/targets/${id}/pause`),
  resume: (id) => api.post(`/targets/${id}/resume`),
};

export const logsAPI = {
  getRecent: () => api.get('/logs/recent'),
  getStats: () => api.get('/logs/stats'),
  getTargetLogs: (targetId, params = {}) => api.get(`/logs/${targetId}`, { params }),
};

export const alertsAPI = {
  testAlert: (targetId, status = 'DOWN') => api.post(`/alerts/test/${targetId}`, { status }),
};

export default api;