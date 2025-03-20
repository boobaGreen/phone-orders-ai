import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { updatePassword } from "../../services/supabase";

const ResetPassword = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    // Validazione password
    if (password !== confirmPassword) {
      setError("Le password non corrispondono");
      setIsLoading(false);
      return;
    }

    if (password.length < 8) {
      setError("La password deve contenere almeno 8 caratteri");
      setIsLoading(false);
      return;
    }

    try {
      await updatePassword(password);
      // Redirect al login con messaggio di successo
      navigate("/auth/login", {
        state: { message: "Password aggiornata con successo" },
      });
    } catch (err) {
      console.error("Update password error:", err);
      setError("Errore nell'aggiornamento della password. Riprova più tardi.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-[color:var(--color-background)]">
      <div className="w-full max-w-md p-8 space-y-8 bg-gray-800 rounded-lg shadow-lg">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-black dark:text-white">
            Reimposta la tua password
          </h1>
          <p className="mt-2 text-gray-700 dark:text-gray-300">
            Inserisci la nuova password per il tuo account.
          </p>
        </div>

        {error && (
          <div className="p-4 mb-4 text-sm rounded-lg bg-[color:var(--color-destructive-light)] text-[color:var(--color-destructive)]">
            {error}
          </div>
        )}

        <form className="space-y-6" onSubmit={handleSubmit}>
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-black dark:text-white"
            >
              Nuova Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              className="block w-full px-3 py-2 mt-1 border rounded-md shadow-sm text-black dark:text-white bg-[color:var(--color-input)] border-[color:var(--color-border)] focus:outline-none focus:ring-2 focus:ring-[#4285F4]"
              placeholder="Almeno 8 caratteri"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div>
            <label
              htmlFor="confirmPassword"
              className="block text-sm font-medium text-black dark:text-white"
            >
              Conferma Password
            </label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              required
              className="block w-full px-3 py-2 mt-1 border rounded-md shadow-sm text-black dark:text-white bg-[color:var(--color-input)] border-[color:var(--color-border)] focus:outline-none focus:ring-2 focus:ring-[#4285F4]"
              placeholder="Ripeti la nuova password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="flex justify-center w-full px-4 py-2 text-sm font-medium text-center rounded-md shadow-sm text-white bg-[#4285F4] hover:bg-[#3367d6] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#4285F4] disabled:opacity-50 transition-colors"
            >
              {isLoading ? "Aggiornamento..." : "Aggiorna Password"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;
