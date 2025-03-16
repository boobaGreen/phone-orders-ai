import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/auth-store";
import { getSupabaseToken } from "../../services/supabase";

/**
 * AuthCallback Component
 *
 * Questo componente gestisce il callback dopo l'autenticazione OAuth con Supabase (Google).
 * Verifica il token ricevuto, fa login con il backend, e reindirizza alla dashboard.
 */
const AuthCallback = () => {
  const [error, setError] = useState<string | null>(null);
  const { login } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        console.log("Processing auth callback...");

        // Ottieni il token dalla sessione Supabase
        const token = await getSupabaseToken();

        if (!token) {
          throw new Error("No token received from Supabase");
        }

        console.log("Supabase token received, calling backend login...");

        // Usa lo store Zustand per fare login con il backend
        await login(token);

        console.log("Login successful, redirecting to dashboard");
        navigate("/dashboard");
      } catch (error) {
        console.error("Auth callback error:", error);
        setError(
          error instanceof Error
            ? error.message
            : "Unknown error during authentication"
        );
      }
    };

    handleCallback();
  }, [login, navigate]);

  // Se c'è un errore, mostralo all'utente
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[color:var(--color-background)]">
        <div className="max-w-md w-full p-8 rounded-lg bg-[color:var(--color-card)] shadow-lg text-center">
          <h2 className="text-2xl font-bold text-[color:var(--color-destructive)] mb-4">
            Errore di autenticazione
          </h2>
          <p className="mb-6">{error}</p>
          <button
            onClick={() => navigate("/auth/login")}
            className="px-4 py-2 bg-[color:var(--color-primary)] text-[color:var(--color-primary-foreground)] rounded"
          >
            Torna al login
          </button>
        </div>
      </div>
    );
  }

  // Mostra un indicatore di caricamento mentre l'autenticazione è in corso
  return (
    <div className="min-h-screen flex items-center justify-center bg-[color:var(--color-background)]">
      <div className="max-w-md w-full p-8 rounded-lg bg-[color:var(--color-card)] shadow-lg text-center">
        <h2 className="text-2xl font-bold text-[color:var(--color-primary)] mb-6">
          Autenticazione in corso...
        </h2>
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[color:var(--color-primary)]"></div>
        </div>
        <p className="mt-6 text-[color:var(--color-muted-foreground)]">
          Stiamo completando il processo di autenticazione.
        </p>
      </div>
    </div>
  );
};

export default AuthCallback;
