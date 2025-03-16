/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { authAPI } from "../services/api";
import { signInWithGoogle, signOut } from "../services/supabase";

interface AuthState {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  user: any | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  // Actions
  login: (supabaseToken: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  register: (email: string, name: string, supabaseId: string) => Promise<void>;
  logout: () => Promise<void>;
  getMe: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, _get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      login: async (supabaseToken: string) => {
        try {
          set({ isLoading: true, error: null });

          const { data } = await authAPI.login({ supabaseToken });

          set({
            user: data.user,
            token: data.token,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error: any) {
          set({
            error: error.response?.data?.message || "Error logging in",
            isLoading: false,
          });
        }
      },

      loginWithGoogle: async () => {
        try {
          set({ isLoading: true, error: null });

          const { error } = await signInWithGoogle();

          if (error) {
            throw new Error(error.message);
          }

          set({ isLoading: false });
        } catch (error: any) {
          set({
            error: error.message || "Error logging in with Google",
            isLoading: false,
          });
        }
      },

      register: async (email: string, name: string, supabaseId: string) => {
        try {
          set({ isLoading: true, error: null });

          const { data } = await authAPI.register({ email, name, supabaseId });

          set({
            user: data.user,
            token: data.token,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error: any) {
          set({
            error: error.response?.data?.message || "Error registering",
            isLoading: false,
          });
        }
      },

      logout: async () => {
        try {
          set({ isLoading: true });

          await signOut();

          set({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
          });
        } catch (error: any) {
          set({
            error: error.message || "Error logging out",
            isLoading: false,
          });
        }
      },

      getMe: async () => {
        try {
          set({ isLoading: true });

          const { data } = await authAPI.getMe();

          set({
            user: data.user,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error) {
          set({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
          });
        }
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({ token: state.token }),
    }
  )
);
