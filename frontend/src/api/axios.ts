import axios from 'axios';
import { auth } from '../firebase';

// Vytvoříme instanci Axiosu pro naše Backend API
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'https://kebab-rating-backend.v-vizvary.workers.dev', // Backend API
});

// Každý request, který odchází do backendu, dostane svůj JWT token
api.interceptors.request.use(async (config) => {
  const user = auth.currentUser;
  
  if (user) {
    const token = await user.getIdToken();
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  return config;
}, (error) => {
  return Promise.reject(error);
});

export default api;
