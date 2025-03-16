// client/src/pages/auth/AuthCallback.tsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/auth-store";
import { supabase, getSupabaseToken } from "../services/supabase";

const AuthCallback = () => {
  const [error, setError] = useState<string | null>(null);
  const { login, register } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Ottieni il token dalla sessione (dopo il redirect OAuth)
        const token = await getSupabaseToken();

        if (!token) {
          throw new Error("Impossibile ottenere il token di autenticazione");
        }

        // Ottieni l'utente Supabase
        const {
          data: { user },
        } = await supabase.auth.getUser(token);

        if (!user) {
          throw new Error("Utente non trovato");
        }

        // Controlla se è un nuovo utente o un utente esistente
        const isNewUser =
          user.app_metadata.provider === "google" &&
          user.created_at === user.updated_at;

        if (isNewUser) {
          // Per un nuovo utente, registralo nel backend
          const name =
            user.user_metadata.full_name ||
            user.user_metadata.name ||
            user.email?.split("@")[0] ||
            "Utente";

          await register(user.email || "", name, user.id);
        } else {
          // Per un utente esistente, esegui il login
          await login(token);
        }

        // Reindirizza alla dashboard
        navigate("/dashboard");
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (error: any) {
        console.error("Errore durante la gestione del callback:", error);
        setError(
          error.message || "Si è verificato un errore durante l'autenticazione"
        );
      }
    };

    handleAuthCallback();
  }, [login, register, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[color:var(--color-background)]">
      <div className="max-w-md w-full p-8 rounded-lg bg-[color:var(--color-card)] shadow-lg text-center">
        {error ? (
          <>
            <h2 className="text-2xl font-bold text-[color:var(--color-destructive)] mb-4">
              Errore di autenticazione
            </h2>
            <p className="mb-4">{error}</p>
            <button
              onClick={() => navigate("/auth/login")}
              className="px-4 py-2 bg-[color:var(--color-primary)] text-[color:var(--color-primary-foreground)] rounded"
            >
              Torna al login
            </button>
          </>
        ) : (
          <>
            <h2 className="text-2xl font-bold text-[color:var(--color-primary)] mb-4">
              Autenticazione in corso...
            </h2>
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[color:var(--color-primary)]"></div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AuthCallback;
