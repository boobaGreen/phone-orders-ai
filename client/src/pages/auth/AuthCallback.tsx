import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../services/supabase";
import { login } from "../../services/authService";

const AuthCallback = () => {
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    console.log("Processing auth callback...");

    // Recupera il token e l'utente dalla sessione Supabase
    const processAuth = async () => {
      try {
        // Questo gestirà automaticamente il token dall'URL del callback
        const { data, error } = await supabase.auth.getSession();

        if (error) {
          console.error("Errore nel recupero della sessione:", error);
          setError("Errore di autenticazione. Riprova più tardi.");
          return;
        }

        if (data?.session?.access_token) {
          console.log("Supabase token received, calling backend login...");

          try {
            // Chiama il servizio di login del backend con il token
            await login(data.session.access_token);
            console.log("Login successful, redirecting to dashboard");
            navigate("/dashboard");
          } catch (err) {
            console.error("Error during backend login:", err);
            setError("Errore durante il login. Riprova più tardi.");
          }
        } else {
          console.error("No session or token found");
          setError("Nessun token trovato nell'URL di callback.");
        }
      } catch (e) {
        console.error("Critical error in auth callback:", e);
        setError("Errore critico durante l'autenticazione.");
      }
    };

    processAuth();
  }, [navigate]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      {error ? (
        <div className="bg-red-100 text-red-800 p-4 rounded-md">
          <h2 className="text-lg font-semibold">Errore</h2>
          <p>{error}</p>
          <button
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
            onClick={() => navigate("/auth/login")}
          >
            Torna al login
          </button>
        </div>
      ) : (
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-xl">Autenticazione in corso...</p>
          <p className="mt-2 text-gray-500">Sarai reindirizzato a breve</p>
        </div>
      )}
    </div>
  );
};

export default AuthCallback;
