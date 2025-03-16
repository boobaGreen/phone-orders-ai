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
      <div className="w-full max-w-md p-8 space-y-8 bg-[color:var(--color-card)] rounded-lg shadow-lg">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Recupero Password</h1>
          <p className="mt-2 text-[color:var(--color-muted-foreground)]">
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
              className="block text-sm font-medium text-[color:var(--color-foreground)]"
            >
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              className="block w-full px-3 py-2 mt-1 border rounded-md shadow-sm text-[color:var(--color-foreground)] bg-[color:var(--color-input)] border-[color:var(--color-border)] focus:outline-none focus:ring-2 focus:ring-[color:var(--color-primary)] focus:border-transparent"
              placeholder="Il tuo indirizzo email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="flex justify-center w-full px-4 py-2 text-sm font-medium text-center rounded-md shadow-sm text-[color:var(--color-primary-foreground)] bg-[color:var(--color-primary)] hover:bg-[color:var(--color-primary-dark)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[color:var(--color-primary)] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Invio in corso..." : "Invia link di reset"}
            </button>
          </div>
        </form>

        <div className="text-center text-sm text-[color:var(--color-muted-foreground)]">
          <Link
            to="/auth/login"
            className="font-medium text-[color:var(--color-primary)] hover:text-[color:var(--color-primary-dark)]"
          >
            Torna al login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
