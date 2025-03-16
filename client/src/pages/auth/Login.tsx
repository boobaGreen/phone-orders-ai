// client/src/pages/auth/Login.tsx
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/auth-store";
import { signInWithEmail, getSupabaseToken } from "../../services/supabase";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");

  const { login, loginWithGoogle, isLoading, error, clearError } =
    useAuthStore();
  const navigate = useNavigate();

  // Reset errori quando l'utente modifica i campi
  const handleInputChange = (
    setter: React.Dispatch<React.SetStateAction<string>>,
    value: string
  ) => {
    if (loginError) setLoginError("");
    if (error) clearError();
    setter(value);
  };

  // Login con email e password
  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const { error } = await signInWithEmail(email, password);

      if (error) {
        setLoginError(error.message);
        return;
      }

      // Ottieni il token Supabase e accedi con il backend
      const supabaseToken = await getSupabaseToken();
      if (supabaseToken) {
        await login(supabaseToken);
        navigate("/dashboard");
      } else {
        setLoginError("Impossibile ottenere il token di autenticazione");
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      setLoginError(error.message || "Errore durante il login");
    }
  };

  // Assicurati che la funzione handleGoogleLogin funzioni correttamente
  const handleGoogleLogin = async () => {
    try {
      await loginWithGoogle(); // Dalla store Zustand
      // Il redirect è gestito da Supabase
    } catch (error) {
      console.error("Google login error:", error);
      setLoginError("Errore durante l'accesso con Google");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[color:var(--color-background)]">
      <div className="max-w-md w-full p-8 rounded-lg bg-[color:var(--color-card)] shadow-lg">
        <h2 className="text-2xl font-bold text-center text-[color:var(--color-primary)] mb-6">
          Accedi
        </h2>

        {/* Mostra eventuali errori */}
        {(loginError || error) && (
          <div className="bg-[color:var(--color-destructive)] bg-opacity-10 border border-[color:var(--color-destructive)] text-[color:var(--color-destructive)] p-3 rounded mb-4">
            {loginError || error}
          </div>
        )}

        {/* Form di login */}
        <form onSubmit={handleEmailLogin} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-1">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => handleInputChange(setEmail, e.target.value)}
              className="w-full p-2 border border-[color:var(--color-border)] rounded bg-[color:var(--color-background)]"
              disabled={isLoading}
              required
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium mb-1"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => handleInputChange(setPassword, e.target.value)}
              className="w-full p-2 border border-[color:var(--color-border)] rounded bg-[color:var(--color-background)]"
              disabled={isLoading}
              required
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2 px-4 bg-[color:var(--color-primary)] text-[color:var(--color-primary-foreground)] rounded hover:opacity-90 disabled:opacity-50"
          >
            {isLoading ? "Accesso in corso..." : "Accedi"}
          </button>
        </form>

        {/* Aggiungi questo link vicino al pulsante di login */}
        <div className="text-center text-sm mt-4">
          <Link
            to="/auth/forgot-password"
            className="font-medium text-[color:var(--color-primary)] hover:text-[color:var(--color-primary-dark)]"
          >
            Password dimenticata?
          </Link>
        </div>

        {/* Separatore */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-[color:var(--color-border)]"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-[color:var(--color-card)] text-[color:var(--color-muted-foreground)]">
              oppure
            </span>
          </div>
        </div>

        {/* Login con Google */}
        <button
          onClick={handleGoogleLogin}
          disabled={isLoading}
          className="w-full py-2 px-4 border border-[color:var(--color-border)] rounded flex items-center justify-center gap-2 hover:bg-[color:var(--color-muted)] disabled:opacity-50"
        >
          <svg width="20" height="20" viewBox="0 0 24 24">
            <path
              fill="currentColor"
              d="M21.35,11.1H12.18V13.83H18.69C18.36,17.64 15.19,19.27 12.19,19.27C8.36,19.27 5,16.25 5,12C5,7.9 8.2,4.73 12.2,4.73C15.29,4.73 17.1,6.7 17.1,6.7L19,4.72C19,4.72 16.56,2 12.1,2C6.42,2 2.03,6.8 2.03,12C2.03,17.05 6.16,22 12.25,22C17.6,22 21.5,18.33 21.5,12.91C21.5,11.76 21.35,11.1 21.35,11.1V11.1Z"
            />
          </svg>
          {isLoading ? "Accesso in corso..." : "Continua con Google"}
        </button>

        {/* Link per registrazione */}
        <p className="mt-4 text-center text-sm">
          Non hai un account?{" "}
          <Link
            to="/auth/register"
            className="text-[color:var(--color-primary)] hover:underline"
          >
            Registrati
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
