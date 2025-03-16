import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/auth-store";
import { useState } from "react";
import { Menu, X, User, LogOut, Settings, Home } from "lucide-react";
import { ThemeToggle } from "../ui/ThemeToggle";

const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuthStore();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/auth/login");
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <nav className="sticky top-0 z-40 w-full border-b border-[color:var(--color-border)] bg-[color:var(--color-card)] shadow-sm">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center space-x-4">
            <Link
              to="/"
              className="text-xl font-bold text-[color:var(--color-primary)]"
            >
              Phone Orders AI
            </Link>
          </div>

          {/* Menu principale desktop - tutte le voci visibili */}
          {isAuthenticated && (
            <div className="hidden md:flex items-center space-x-6">
              <Link
                to="/dashboard"
                className="flex items-center text-[color:var(--color-foreground)] hover:text-[color:var(--color-primary)] transition-colors"
              >
                <Home size={18} className="mr-1" />
                Dashboard
              </Link>
              <Link
                to="/profile"
                className="flex items-center text-[color:var(--color-foreground)] hover:text-[color:var(--color-primary)] transition-colors"
              >
                <User size={18} className="mr-1" />
                Profilo
              </Link>
              <Link
                to="/dashboard/settings"
                className="flex items-center text-[color:var(--color-foreground)] hover:text-[color:var(--color-primary)] transition-colors"
              >
                <Settings size={18} className="mr-1" />
                Impostazioni
              </Link>
              <button
                onClick={handleLogout}
                className="flex items-center text-[color:var(--color-destructive)] hover:text-[color:var(--color-destructive)]/90 transition-colors"
              >
                <LogOut size={18} className="mr-1" />
                Logout
              </button>
            </div>
          )}

          {/* Toggle tema e mobile menu button */}
          <div className="flex items-center space-x-4">
            {/* Avatar e nome utente in desktop */}
            {isAuthenticated && (
              <div className="hidden md:flex items-center mr-4">
                <div className="w-8 h-8 rounded-full bg-[color:var(--color-primary)] text-[color:var(--color-primary-foreground)] flex items-center justify-center mr-2">
                  {user?.name?.charAt(0) || "U"}
                </div>
                <span className="hidden lg:block text-sm font-medium">
                  {user?.name || "Utente"}
                </span>
              </div>
            )}

            {/* Toggle Tema - sempre visibile */}
            <ThemeToggle />

            {/* Login/register pulsanti in desktop */}
            {!isAuthenticated && (
              <div className="hidden md:flex items-center space-x-4">
                <Link
                  to="/auth/login"
                  className="text-[color:var(--color-foreground)] hover:text-[color:var(--color-primary)]"
                >
                  Accedi
                </Link>
                <Link
                  to="/auth/register"
                  className="px-4 py-2 bg-[color:var(--color-primary)] text-[color:var(--color-primary-foreground)] rounded hover:opacity-90"
                >
                  Registrati
                </Link>
              </div>
            )}

            {/* Menu mobile toggle */}
            <button
              className="md:hidden p-2 rounded-md text-[color:var(--color-foreground)]"
              onClick={toggleMenu}
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile menu - rimane invariato */}
        {isMenuOpen && (
          <div className="md:hidden mt-3 pt-3 border-t border-[color:var(--color-border)]">
            {isAuthenticated ? (
              <>
                <div className="flex items-center space-x-3 mb-3 pb-3 border-b border-[color:var(--color-border)]">
                  <div className="w-8 h-8 rounded-full bg-[color:var(--color-primary)] text-[color:var(--color-primary-foreground)] flex items-center justify-center">
                    {user?.name?.charAt(0) || "U"}
                  </div>
                  <div>
                    <p className="text-sm font-medium">{user?.name}</p>
                    <p className="text-xs text-[color:var(--color-muted-foreground)] truncate">
                      {user?.email}
                    </p>
                  </div>
                </div>
                <Link
                  to="/dashboard"
                  className="py-2 text-[color:var(--color-foreground)] hover:text-[color:var(--color-primary)] flex items-center"
                  onClick={toggleMenu}
                >
                  <Home size={18} className="mr-2" />
                  Dashboard
                </Link>
                <Link
                  to="/profile"
                  className="py-2 text-[color:var(--color-foreground)] hover:text-[color:var(--color-primary)] flex items-center"
                  onClick={toggleMenu}
                >
                  <User size={18} className="mr-2" />
                  Profilo
                </Link>
                <Link
                  to="/dashboard/settings"
                  className="py-2 text-[color:var(--color-foreground)] hover:text-[color:var(--color-primary)] flex items-center"
                  onClick={toggleMenu}
                >
                  <Settings size={18} className="mr-2" />
                  Impostazioni
                </Link>
                <button
                  onClick={() => {
                    handleLogout();
                    toggleMenu();
                  }}
                  className="w-full text-left py-2 text-[color:var(--color-destructive)] flex items-center"
                >
                  <LogOut size={18} className="mr-2" />
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/auth/login"
                  className="block py-2 text-[color:var(--color-foreground)] hover:text-[color:var(--color-primary)]"
                  onClick={toggleMenu}
                >
                  Accedi
                </Link>
                <Link
                  to="/auth/register"
                  className="block py-2 text-[color:var(--color-foreground)] hover:text-[color:var(--color-primary)]"
                  onClick={toggleMenu}
                >
                  Registrati
                </Link>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
