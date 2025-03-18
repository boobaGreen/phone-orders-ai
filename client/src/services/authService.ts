import axios from "axios";

// Crea un'istanza di axios per le chiamate API
const api = axios.create({
  baseURL: import.meta.env.PROD ? "/api" : import.meta.env.VITE_API_URL,
  withCredentials: true,
});

// Login con token Supabase
export const login = async (token: string) => {
  try {
    console.log("Logging in with token:", token.substring(0, 10) + "...");

    // Usa l'URL relativo "/auth/login" invece di un URL hardcoded
    const response = await api.post("/auth/login", { token });
    return response.data;
  } catch (error) {
    console.error("Login error:", error);
    throw error;
  }
};

// Logout
export const logout = async () => {
  try {
    const response = await api.post("/auth/logout");
    return response.data;
  } catch (error) {
    console.error("Logout error:", error);
    throw error;
  }
};

// Controlla lo stato di autenticazione
export const checkAuth = async () => {
  try {
    const response = await api.get("/auth/me");
    return response.data;
  } catch (error) {
    console.error("Check auth error:", error);
    throw error;
  }
};

export default {
  login,
  logout,
  checkAuth,
};
