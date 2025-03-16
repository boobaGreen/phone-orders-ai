import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/auth-store";
import { useState } from "react";
import {
  Menu,
  X,
  User,
  LogOut,
  Settings,
  Home,
  PieChart,
  Plus,
} from "lucide-react";

const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuthStore();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/auth/login");
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
    if (isUserMenuOpen) setIsUserMenuOpen(false);
  };

  const toggleUserMenu = () => {
    setIsUserMenuOpen(!isUserMenuOpen);
    if (isMenuOpen) setIsMenuOpen(false);
  };

  return (
    <nav className="sticky top-0 z-40 w-full border-b border-[color:var(--color-border)] bg-[color:var(--color-card)] shadow-sm">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo e titolo */}
          <Link to="/dashboard" className="flex items-center">
            <span className="text-2xl font-bold text-[color:var(--color-primary)]">
              Pizzeria SaaS
            </span>
          </Link>

          {/* Menu desktop */}
          <div className="hidden md:flex items-center space-x-6">
            {isAuthenticated && (
              <>
                <Link
                  to="/dashboard"
                  className="flex items-center text-[color:var(--color-foreground)] hover:text-[color:var(--color-primary)] transition-colors"
                >
                  <Home size={18} className="mr-1" />
                  Dashboard
                </Link>
                <Link
                  to="/businesses"
                  className="flex items-center text-[color:var(--color-foreground)] hover:text-[color:var(--color-primary)] transition-colors"
                >
                  <PieChart size={18} className="mr-1" />
                  Ristoranti
                </Link>
                <Link
                  to="/businesses/new"
                  className="flex items-center text-[color:var(--color-foreground)] hover:text-[color:var(--color-primary)] transition-colors"
                >
                  <Plus size={18} className="mr-1" />
                  Nuovo
                </Link>
              </>
            )}
          </div>

          {/* User menu desktop */}
          {isAuthenticated ? (
            <div className="hidden md:flex items-center">
              <div className="relative">
                <button
                  onClick={toggleUserMenu}
                  className="flex items-center space-x-2 focus:outline-none"
                >
                  <div className="w-8 h-8 rounded-full bg-[color:var(--color-primary)] text-[color:var(--color-primary-foreground)] flex items-center justify-center">
                    {user?.name?.charAt(0) || "U"}
                  </div>
                  <span className="hidden lg:block">
                    {user?.name || "Utente"}
                  </span>
                </button>

                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 py-2 bg-[color:var(--color-card)] border border-[color:var(--color-border)] rounded-md shadow-lg">
                    <div className="px-4 py-2 border-b border-[color:var(--color-border)]">
                      <p className="text-sm font-medium">{user?.name}</p>
                      <p className="text-xs text-[color:var(--color-muted-foreground)] truncate">
                        {user?.email}
                      </p>
                    </div>
                    <Link
                      to="/profile"
                      className="px-4 py-2 text-sm hover:bg-[color:var(--color-muted)] flex items-center"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      <User size={16} className="mr-2" />
                      Profilo
                    </Link>
                    <Link
                      to="/settings"
                      className="px-4 py-2 text-sm hover:bg-[color:var(--color-muted)] flex items-center"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      <Settings size={16} className="mr-2" />
                      Impostazioni
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-sm hover:bg-[color:var(--color-muted)] flex items-center text-[color:var(--color-destructive)]"
                    >
                      <LogOut size={16} className="mr-2" />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
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

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={toggleMenu}
              className="text-[color:var(--color-foreground)] p-2 focus:outline-none"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
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
                  className=" py-2 text-[color:var(--color-foreground)] hover:text-[color:var(--color-primary)] flex items-center"
                  onClick={toggleMenu}
                >
                  <Home size={18} className="mr-2" />
                  Dashboard
                </Link>
                <Link
                  to="/businesses"
                  className=" py-2 text-[color:var(--color-foreground)] hover:text-[color:var(--color-primary)] flex items-center"
                  onClick={toggleMenu}
                >
                  <PieChart size={18} className="mr-2" />
                  Ristoranti
                </Link>
                <Link
                  to="/businesses/new"
                  className="py-2 text-[color:var(--color-foreground)] hover:text-[color:var(--color-primary)] flex items-center"
                  onClick={toggleMenu}
                >
                  <Plus size={18} className="mr-2" />
                  Nuovo Ristorante
                </Link>
                <Link
                  to="/profile"
                  className=" py-2 text-[color:var(--color-foreground)] hover:text-[color:var(--color-primary)] flex items-center"
                  onClick={toggleMenu}
                >
                  <User size={18} className="mr-2" />
                  Profilo
                </Link>
                <Link
                  to="/settings"
                  className=" py-2 text-[color:var(--color-foreground)] hover:text-[color:var(--color-primary)] flex items-center"
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
                  className=" w-full text-left py-2 text-[color:var(--color-destructive)] flex items-center"
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
