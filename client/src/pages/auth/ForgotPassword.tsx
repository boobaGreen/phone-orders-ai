import { useState } from "react";
import { Link } from "react-router-dom";
import { resetPassword } from "../../services/supabase";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      await resetPassword(email);
      setSuccessMessage(
        "Ti abbiamo inviato un'email con il link per reimpostare la password."
      );
      setEmail("");
    } catch (err) {
      console.error("Reset password error:", err);
      setError(
        "Si è verificato un errore nell'invio dell'email. Riprova più tardi."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-[color:var(--color-background)]">
      <div className="w-full max-w-md p-8 space-y-8 bg-gray-800 rounded-lg shadow-lg">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-black dark:text-white">
            Recupero Password
          </h1>
          <p className="mt-2 text-gray-700 dark:text-gray-300">
            Inserisci l'email associata al tuo account per ricevere il link di
            reset.
          </p>
        </div>

        {successMessage && (
          <div className="p-4 mb-4 text-sm rounded-lg bg-[color:var(--color-success-light)] text-[color:var(--color-success)]">
            {successMessage}
          </div>
        )}

        {error && (
          <div className="p-4 mb-4 text-sm rounded-lg bg-[color:var(--color-destructive-light)] text-[color:var(--color-destructive)]">
            {error}
          </div>
        )}

        <form className="space-y-6" onSubmit={handleSubmit}>
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-black dark:text-white"
            >
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              className="block w-full px-3 py-2 mt-1 border rounded-md shadow-sm text-black dark:text-white bg-[color:var(--color-input)] border-[color:var(--color-border)] focus:outline-none focus:ring-2 focus:ring-[#4285F4]"
              placeholder="Il tuo indirizzo email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="flex justify-center w-full px-4 py-2 text-sm font-medium text-center rounded-md shadow-sm text-white bg-[#4285F4] hover:bg-[#3367d6] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#4285F4] disabled:opacity-50 transition-colors"
            >
              {isLoading ? "Invio in corso..." : "Invia link di reset"}
            </button>
          </div>
        </form>

        <div className="text-center text-sm text-gray-600 dark:text-gray-300">
          <Link
            to="/auth/login"
            className="font-medium text-[#4285F4] dark:text-[#8ab4f8] hover:underline"
          >
            Torna al login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
