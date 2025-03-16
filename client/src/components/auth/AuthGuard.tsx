import { ReactNode, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/auth-store";

interface AuthGuardProps {
  children: ReactNode;
}

const AuthGuard = ({ children }: AuthGuardProps) => {
  const { isAuthenticated, token } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated && !token) {
      navigate("/auth/login", { replace: true });
    }
  }, [isAuthenticated, token, navigate]);

  if (!isAuthenticated && !token) {
    return null;
  }

  return <>{children}</>;
};

export default AuthGuard;
