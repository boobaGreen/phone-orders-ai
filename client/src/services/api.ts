import axios from "axios";

// Determina l'URL base dell'API in base all'ambiente
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3005/api";

// Crea un'istanza di axios con la configurazione di base
const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor per aggiungere il token di autenticazione
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// API endpoints
export const authAPI = {
  register: (data: any) => api.post("/auth/register", data),
  login: (data: any) => api.post("/auth/login", data),
  getMe: () => api.get("/auth/me"),
  verifySupabaseToken: (token: string) =>
    api.post("/auth/verify-supabase", { token }),
};

export const businessAPI = {
  getAll: () => api.get("/business"),
  getById: (id: string) => api.get(`/business/${id}`),
  create: (data: any) => api.post("/business", data),
  update: (id: string, data: any) => api.put(`/business/${id}`, data),
  delete: (id: string) => api.delete(`/business/${id}`),
  getMenu: (id: string) => api.get(`/business/${id}/menu`),
  createMenu: (id: string, data: any) => api.post(`/business/${id}/menu`, data),
  updateMenu: (id: string, data: any) => api.put(`/business/${id}/menu`, data),
};

export const orderAPI = {
  getAll: (params?: any) => api.get("/orders", { params }),
  getById: (id: string) => api.get(`/orders/${id}`),
  create: (data: any) => api.post("/orders", data),
  update: (id: string, data: any) => api.put(`/orders/${id}`, data),
  delete: (id: string) => api.delete(`/orders/${id}`),
  checkSlotAvailability: (params: any) =>
    api.get("/orders/slot/check", { params }),
  getAvailableSlots: (params: any) =>
    api.get("/orders/slot/available", { params }),
};

export default api;
