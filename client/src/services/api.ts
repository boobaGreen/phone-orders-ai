/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from "axios";

// Per debug
console.log("API URL:", import.meta.env.VITE_API_URL);

// Configura axios per usare l'URL corretto
const api = axios.create({
  // Usa l'URL relativo se siamo in produzione
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor per debugging
api.interceptors.request.use(
  (config) => {
    console.log(`API Request to: ${config.baseURL}${config.url}`);
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Versione pulita dell'interceptor
api.interceptors.request.use((config) => {
  const authStorage = localStorage.getItem("auth-storage");
  let token = null;

  if (authStorage) {
    try {
      const parsed = JSON.parse(authStorage);
      token = parsed.state?.token;
    } catch (e) {
      console.error("Error parsing auth storage", e);
    }
  }

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// API endpoints - Auth
export const authAPI = {
  register: (data: any) => api.post("/auth/register", data),
  login: (data: any) => api.post("/auth/login", data),
  getMe: () => api.get("/auth/me"),
  verifySupabaseToken: (token: string) =>
    api.post("/auth/verify-supabase", { token }),
};

// API endpoints - Business (allineamento tra frontend e backend)
export const businessAPI = {
  // Rinominati per allinearsi al backend
  getBusinesses: () => api.get("/businesses"),
  getBusiness: (id: string) => api.get(`/businesses/${id}`),
  createBusiness: (data: any) => api.post("/businesses", data),
  updateBusiness: (id: string, data: any) => api.put(`/businesses/${id}`, data),
  deleteBusiness: (id: string) => api.delete(`/businesses/${id}`),

  // Manteniamo anche i vecchi nomi per retrocompatibilità
  getRestaurants: () => api.get("/businesses"),
  getRestaurant: (id: string) => api.get(`/businesses/${id}`),
  createRestaurant: (data: any) => api.post("/businesses", data),
  updateRestaurant: (id: string, data: any) =>
    api.put(`/businesses/${id}`, data),
  deleteRestaurant: (id: string) => api.delete(`/businesses/${id}`),

  // API Menu
  getMenu: (businessId: string) => api.get(`/businesses/${businessId}/menu`),
  createMenu: (businessId: string, data: any) =>
    api.post(`/businesses/${businessId}/menu`, data),
  updateMenu: (businessId: string, data: any) =>
    api.put(`/businesses/${businessId}/menu`, data),
};

// API endpoints - Orders
export const orderAPI = {
  getOrders: (params?: any) => api.get("/orders", { params }),
  getOrder: (id: string) => api.get(`/orders/${id}`),
  createOrder: (data: any) => api.post("/orders", data),
  updateOrder: (id: string, data: any) => api.put(`/orders/${id}`, data),
  deleteOrder: (id: string) => api.delete(`/orders/${id}`),

  // Endpoints per la disponibilità degli slot
  getAvailableSlots: (businessId: string, date: string) =>
    api.get(`/orders/slots?businessId=${businessId}&date=${date}`),
  checkSlotAvailability: (businessId: string, date: string, time: string) =>
    api.get(
      `/orders/check-slot?businessId=${businessId}&date=${date}&time=${time}`
    ),
};

export default api;
