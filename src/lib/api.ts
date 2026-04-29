import axios from 'axios';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

export const api = axios.create({ baseURL: BASE_URL, timeout: 30000 });

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('hydriva_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Redirect to login on 401
api.interceptors.response.use(
  (r) => r,
  (err) => {
    if (err.response?.status === 401 && typeof window !== 'undefined') {
      localStorage.removeItem('hydriva_token');
      if (!window.location.pathname.startsWith('/login')) window.location.href = '/login';
    }
    return Promise.reject(err);
  },
);

export const weatherApi = {
  getByCoords: (lat: number, lon: number) =>
    api.get('/weather/coords', { params: { lat, lon } }).then((r) => r.data),
  getByCity: (name: string) =>
    api.get('/weather/city', { params: { name } }).then((r) => r.data),
};

export const sensorApi = {
  getCurrent: () => api.get('/sensor/current').then((r) => r.data),
  getHistory: (hours = 24) =>
    api.get('/sensor/history', { params: { hours } }).then((r) => r.data),
};

export const irrigationApi = {
  getStatus: () => api.get('/irrigation/status').then((r) => r.data),
  toggleAutoMode: (enabled: boolean) =>
    api.post('/irrigation/auto-mode', { enabled }).then((r) => r.data),
  getHistory: (limit = 20) =>
    api.get('/irrigation/history', { params: { limit } }).then((r) => r.data),
  getRecommendation: (soilMoisture: number, temperature: number, humidity: number) =>
    api.post('/irrigation/recommend', { soilMoisture, temperature, humidity }).then((r) => r.data),
};

// Legacy plant AI (standalone analysis)
export const plantApi = {
  analyze: (file: File, soilMoisture?: number, temperature?: number, humidity?: number) => {
    const form = new FormData();
    form.append('image', file);
    if (soilMoisture !== undefined) form.append('soilMoisture', String(soilMoisture));
    if (temperature !== undefined) form.append('temperature', String(temperature));
    if (humidity !== undefined) form.append('humidity', String(humidity));
    return api.post('/plant/analyze', form, { headers: { 'Content-Type': 'multipart/form-data' } }).then((r) => r.data);
  },
};

// User plants CRUD
export const plantsApi = {
  getAll: () => api.get('/plants').then((r) => r.data),
  getOne: (id: string) => api.get(`/plants/${id}`).then((r) => r.data),
  create: (data: Record<string, unknown>) => api.post('/plants', data).then((r) => r.data),
  update: (id: string, data: Record<string, unknown>) => api.put(`/plants/${id}`, data).then((r) => r.data),
  delete: (id: string) => api.delete(`/plants/${id}`).then((r) => r.data),
  analyze: (id: string, file: File, soilMoisture?: number, temperature?: number, humidity?: number) => {
    const form = new FormData();
    form.append('image', file);
    if (soilMoisture !== undefined) form.append('soilMoisture', String(soilMoisture));
    if (temperature !== undefined) form.append('temperature', String(temperature));
    if (humidity !== undefined) form.append('humidity', String(humidity));
    return api.post(`/plants/${id}/analyze`, form, { headers: { 'Content-Type': 'multipart/form-data' } }).then((r) => r.data);
  },
  getAnalyses: (id: string) => api.get(`/plants/${id}/analyses`).then((r) => r.data),
};

export const chatApi = {
  getHistory: (plantId: string) => api.get(`/chat/${plantId}`).then((r) => r.data),
  send: (plantId: string, message: string) =>
    api.post(`/chat/${plantId}`, { message }).then((r) => r.data),
  clear: (plantId: string) => api.delete(`/chat/${plantId}`).then((r) => r.data),
};

export const remindersApi = {
  getAll: () => api.get('/reminders').then((r) => r.data),
  getDue: () => api.get('/reminders/due').then((r) => r.data),
  create: (data: Record<string, unknown>) => api.post('/reminders', data).then((r) => r.data),
  complete: (id: string) => api.put(`/reminders/${id}/complete`).then((r) => r.data),
  delete: (id: string) => api.delete(`/reminders/${id}`).then((r) => r.data),
};
