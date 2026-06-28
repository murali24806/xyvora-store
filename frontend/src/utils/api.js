import axios from 'axios';

// Point this at your deployed backend URL in production (e.g. via .env: VITE_API_URL)
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
});

// Attach admin token automatically if present
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('xyvora_admin_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
export { API_URL };
