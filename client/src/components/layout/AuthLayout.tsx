// client/src/components/layout/AuthLayout.tsx

import { Outlet, Navigate } from "react-router-dom";
import { useAuthStore } from "../../store/auth-store";

const AuthLayout = () => {
  const { isAuthenticated, isLoading } = useAuthStore();

  // Se l'utente è già autenticato, reindirizza alla dashboard
  if (isAuthenticated && !isLoading) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen bg-[color:var(--color-background)]">
      <div className="container mx-auto px-4">
        <Outlet />
      </div>
    </div>
  );
};

export default AuthLayout;
