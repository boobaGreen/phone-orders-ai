// client/src/components/auth/AuthGuard.tsx
import { ReactNode, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/auth-store";

interface AuthGuardProps {
  children: ReactNode;
}

const AuthGuard = ({ children }: AuthGuardProps) => {
  const { isAuthenticated, token, isLoading } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && !isAuthenticated && !token) {
      navigate("/auth/login", { replace: true });
    }
  }, [isAuthenticated, token, isLoading, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[color:var(--color-background)]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[color:var(--color-primary)]"></div>
      </div>
    );
  }

  if (!isAuthenticated && !token) {
    return null;
  }

  return <>{children}</>;
};

export default AuthGuard;
