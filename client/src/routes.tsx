// client/src/routes.tsx
import { createBrowserRouter, Navigate } from "react-router-dom";

// Layouts
import MainLayout from "./components/layout/MainLayout";
import AuthLayout from "./components/layout/AuthLayout";

// Pages
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import AuthCallback from "./pages/auth/AuthCallback"; // Percorso corretto all'import
import ForgotPassword from "./pages/auth/ForgotPassword";
import ResetPassword from "./pages/auth/ResetPassword";
import Dashboard from "./pages/dashboard/Dashboard";
import NotFound from "./pages/NotFound";
import NewRestaurant from "./pages/restaurants/NewRestaurant";
import BusinessDetails from "./pages/businesses/BusinessDetails"; // Importa il componente per i dettagli del business

// Auth guard
import AuthGuard from "./components/auth/AuthGuard";

export const router = createBrowserRouter([
  // Auth routes
  {
    path: "auth",
    element: <AuthLayout />,
    children: [
      {
        path: "",
        element: <Navigate to="/auth/login" replace />,
      },
      {
        path: "login",
        element: <Login />,
      },
      {
        path: "register",
        element: <Register />,
      },
      {
        path: "callback", // Importante: questo deve corrispondere al redirectUrl in signInWithGoogle
        element: <AuthCallback />,
      },
      {
        path: "forgot-password",
        element: <ForgotPassword />,
      },
      {
        path: "reset-password",
        element: <ResetPassword />,
      },
    ],
  },

  // Main app routes (protected)
  {
    path: "/",
    element: (
      <AuthGuard>
        <MainLayout />
      </AuthGuard>
    ),
    children: [
      {
        index: true,
        element: <Navigate to="/dashboard" replace />,
      },
      {
        path: "dashboard",
        element: (
          <AuthGuard>
            <Dashboard />
          </AuthGuard>
        ),
      },
      // Nuove route per i ristoranti
      {
        path: "businesses/new", // Invece di "restaurants/new"
        element: (
          <AuthGuard>
            <NewRestaurant />
          </AuthGuard>
        ),
      },
      // Aggiungi questa nuova route per i dettagli del business
      {
        path: "businesses/:id",
        element: (
          <AuthGuard>
            <BusinessDetails />
          </AuthGuard>
        ),
      },
      // Aggiungeremo altre route per ristoranti in seguito
    ],
  },

  // 404 page
  {
    path: "*",
    element: <NotFound />,
  },
]);
