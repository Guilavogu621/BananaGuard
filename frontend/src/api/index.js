import axios from 'axios';

const hostname = window.location.hostname;
const API_URL = `http://${hostname}:8000/api`;
export const IMAGE_BASE_URL = `http://${hostname}:8000/uploads`;

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
};

export default api;
