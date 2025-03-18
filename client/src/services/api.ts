/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from "axios";

// Usa l'URL esatto dalla variabile d'ambiente, come in locale
const apiUrl = import.meta.env.VITE_API_URL;
console.log("API URL configuration:", apiUrl);

const api = axios.create({
  baseURL: apiUrl,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

// Aggiungi un interceptor per debugging
api.interceptors.request.use(
  (config) => {
    console.log(`API Request to: ${config.baseURL}${config.url}`);
    return config;
  },
  (error) => Promise.reject(error)
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

// Estendi l'istanza di axios per supportare multipart/form-data
export const uploadFile = async (url: string, formData: any) => {
  return api.post(url, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

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
