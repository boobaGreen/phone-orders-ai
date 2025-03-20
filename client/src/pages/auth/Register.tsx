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
        <h2 className="text-2xl font-bold text-center text-black dark:text-white mb-6">
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
            <label
              htmlFor="name"
              className="block text-sm font-medium mb-1 text-black dark:text-white"
            >
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
            <label
              htmlFor="email"
              className="block text-sm font-medium mb-1 text-black dark:text-white"
            >
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
              className="block text-sm font-medium mb-1 text-black dark:text-white"
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
            className="w-full py-2 px-4 bg-[#4285F4] hover:bg-[#3367d6] text-white rounded transition-colors disabled:opacity-50"
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
            <span className="px-2 bg-[color:var(--color-card)] text-gray-600 dark:text-gray-300 font-medium">
              oppure
            </span>
          </div>
        </div>

        {/* Registrazione con Google */}
        <button
          onClick={handleGoogleSignUp}
          disabled={isLoading}
          className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded bg-white dark:bg-[#4285F4] border border-gray-300 dark:border-[#4285F4] hover:bg-gray-50 dark:hover:bg-[#3367d6] transition-colors disabled:opacity-50"
        >
          {/* Logo Google con colori corretti */}
          <div className="bg-white p-1 rounded-full">
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              className="flex-shrink-0"
            >
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
          </div>
          <span className="text-gray-700 dark:text-white font-medium">
            {isLoading ? "Registrazione in corso..." : "Continua con Google"}
          </span>
        </button>

        {/* Link per login */}
        <p className="mt-4 text-center text-sm text-gray-800 dark:text-gray-300">
          Hai già un account?{" "}
          <Link
            to="/auth/login"
            className="text-[#4285F4] dark:text-[#8ab4f8] font-medium hover:underline"
          >
            Accedi
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
