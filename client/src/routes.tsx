// client/src/routes.tsx
import { createBrowserRouter, Navigate } from "react-router-dom";

// Layouts
import MainLayout from "./components/layout/MainLayout";
import AuthLayout from "./components/layout/AuthLayout";

// Pages
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import AuthCallback from "./pages/AuthCallback";
import Dashboard from "./pages/dashboard/Dashboard";
import NotFound from "./pages/NotFound";

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
        path: "callback",
        element: <AuthCallback />,
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
        element: <Dashboard />,
      },
    ],
  },

  // 404 page
  {
    path: "*",
    element: <NotFound />,
  },
]);
