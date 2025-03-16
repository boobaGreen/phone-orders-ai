import React from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { router } from "./routes";
import { useAuthStore } from "./store/auth-store";
import { supabase } from "./services/supabase";
import "./index.css";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minuti
      refetchOnWindowFocus: false,
    },
  },
});

// Componente App che gestisce l'autenticazione
// eslint-disable-next-line react-refresh/only-export-components
function App() {
  const { login, isAuthenticated, getMe } = useAuthStore();

  React.useEffect(() => {
    // Verifica se l'utente è già autenticato
    if (isAuthenticated) {
      getMe();
    }

    // Setup listener per cambiamenti di stato dell'autenticazione
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_IN" && session?.access_token) {
        await login(session.access_token);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [isAuthenticated, getMe, login]);

  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  );
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
