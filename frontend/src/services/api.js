import axios from 'axios';

const BASE = (import.meta.env && import.meta.env.VITE_API_BASE) || 'http://localhost:5001/api';

const api = axios.create({
  baseURL: BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

// helper to set auth token
export function setAuthToken(token) {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common['Authorization'];
  }
}

export const registerUser = async (userData) => {
  try {
  const response = await api.post('/users/register', userData);
    return response.data;
  } catch (error) {
  // preserve full axios error for caller
  throw error;
  }
};

export const loginUser = async (credentials) => {
  try {
  const response = await api.post('/users/login', credentials);
  return response.data;
  } catch (error) {
  throw error;
  }
};

export default api;
