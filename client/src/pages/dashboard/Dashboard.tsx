// client/src/pages/dashboard/Dashboard.tsx
import { useAuthStore } from "../../store/auth-store";

const Dashboard = () => {
  const { user, logout } = useAuthStore();

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-[color:var(--color-primary)] mb-4">
          Dashboard
        </h1>
        <p className="mb-4">Benvenuto, {user?.name || "Utente"}!</p>
      </div>

      <div className="bg-[color:var(--color-card)] p-6 rounded-lg shadow-md mb-6">
        <h2 className="text-xl font-semibold mb-4">Le tue informazioni</h2>
        <div className="space-y-2">
          <p>
            <strong>Email:</strong> {user?.email}
          </p>
          <p>
            <strong>Abbonamento:</strong> {user?.subscriptionTier || "Free"}
          </p>
          {user?.subscriptionEndDate && (
            <p>
              <strong>Scadenza:</strong>{" "}
              {new Date(user.subscriptionEndDate).toLocaleDateString()}
            </p>
          )}
        </div>
      </div>

      <div className="flex justify-end">
        <button
          onClick={logout}
          className="px-4 py-2 bg-[color:var(--color-secondary)] text-[color:var(--color-secondary-foreground)] rounded hover:opacity-90"
        >
          Logout
        </button>
      </div>
    </div>
  );
};

export default Dashboard;
