/* eslint-disable @typescript-eslint/no-explicit-any */
// client/src/pages/auth/Register.tsx
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/auth-store";
import { signUpWithEmail } from "../../services/supabase";

const Register = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [registerError, setRegisterError] = useState("");

  const {
    register: registerUser,
    loginWithGoogle,
    isLoading,
    error,
    clearError,
  } = useAuthStore();
  const navigate = useNavigate();

  // Reset errori quando l'utente modifica i campi
  const handleInputChange = (
    setter: React.Dispatch<React.SetStateAction<string>>,
    value: string
  ) => {
    if (registerError) setRegisterError("");
    if (error) clearError();
    setter(value);
  };

  // Registrazione con email e password
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const { data, error } = await signUpWithEmail(email, password);

      if (error) {
        setRegisterError(error.message);
        return;
      }

      if (data.user) {
        // Registra l'utente nel backend
        await registerUser(email, name, data.user.id);
        navigate("/dashboard");
      } else {
        // Supabase potrebbe richiedere la verifica dell'email
        navigate("/auth/verify-email");
      }
    } catch (error: any) {
      setRegisterError(error.message || "Errore durante la registrazione");
    }
  };

  // Login con Google (per registrazione)
  const handleGoogleSignUp = async () => {
    await loginWithGoogle();
    // Il redirect verrà gestito da Supabase
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[color:var(--color-background)]">
      <div className="max-w-md w-full p-8 rounded-lg bg-[color:var(--color-card)] shadow-lg">
        <h2 className="text-2xl font-bold text-center text-[color:var(--color-primary)] mb-6">
          Registrati
        </h2>

        {/* Mostra eventuali errori */}
        {(registerError || error) && (
          <div className="bg-[color:var(--color-destructive)] bg-opacity-10 border border-[color:var(--color-destructive)] text-[color:var(--color-destructive)] p-3 rounded mb-4">
            {registerError || error}
          </div>
        )}

        {/* Form di registrazione */}
        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium mb-1">
              Nome
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => handleInputChange(setName, e.target.value)}
              className="w-full p-2 border border-[color:var(--color-border)] rounded bg-[color:var(--color-background)]"
              disabled={isLoading}
              required
            />
          </div>

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
            {isLoading ? "Registrazione in corso..." : "Registrati"}
          </button>
        </form>

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

        {/* Registrazione con Google */}
        <button
          onClick={handleGoogleSignUp}
          disabled={isLoading}
          className="w-full py-2 px-4 border border-[color:var(--color-border)] rounded flex items-center justify-center gap-2 hover:bg-[color:var(--color-muted)] disabled:opacity-50"
        >
          <svg width="20" height="20" viewBox="0 0 24 24">
            <path
              fill="currentColor"
              d="M21.35,11.1H12.18V13.83H18.69C18.36,17.64 15.19,19.27 12.19,19.27C8.36,19.27 5,16.25 5,12C5,7.9 8.2,4.73 12.2,4.73C15.29,4.73 17.1,6.7 17.1,6.7L19,4.72C19,4.72 16.56,2 12.1,2C6.42,2 2.03,6.8 2.03,12C2.03,17.05 6.16,22 12.25,22C17.6,22 21.5,18.33 21.5,12.91C21.5,11.76 21.35,11.1 21.35,11.1V11.1Z"
            />
          </svg>
          {isLoading ? "Registrazione in corso..." : "Continua con Google"}
        </button>

        {/* Link per login */}
        <p className="mt-4 text-center text-sm">
          Hai già un account?{" "}
          <Link
            to="/auth/login"
            className="text-[color:var(--color-primary)] hover:underline"
          >
            Accedi
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
