import axios from 'axios';

const API = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api',
  headers: { 'Content-Type': 'application/json' }
});

export const login = (payload: any) => API.post('/auth/login', payload);
export const signup = (payload: any) => API.post('/auth/signup', payload);
export const fetchDashboard = (role: string) => API.get(`/${role}/dashboard`);
export const fetchCommunity = () => API.get('/community');
export const sendDoubt = (payload: any) => API.post('/student/doubt', payload);
export const generateContent = (payload: any) => API.post('/teacher/ai/generate', payload);
export const fetchNotifications = () => API.get('/notifications');
