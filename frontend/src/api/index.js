import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8001/api';
const BASE_URL = import.meta.env.VITE_BASE_URL || 'http://localhost:8001';

export const IMAGE_BASE_URL = `${BASE_URL}/uploads`;

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercepteur pour ajouter le token aux requêtes
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authAPI = {
  signup: (userData) => api.post('/auth/signup', userData),
  login: (credentials) => {
    return api.post('/auth/login', {
      username: credentials.email,
      password: credentials.password,
    });
  },
  getMe: () => api.get('/auth/me'),
  updateProfile: (profileData) => api.put('/auth/profil', profileData),
};

export default api;
