// client/src/routes.tsx
import { createBrowserRouter, Navigate } from "react-router-dom";

// Layouts
import MainLayout from "./components/layout/MainLayout";
import AuthLayout from "./components/layout/AuthLayout";

// Pages
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import AuthCallback from "./pages/auth/AuthCallback";
import ForgotPassword from "./pages/auth/ForgotPassword";
import ResetPassword from "./pages/auth/ResetPassword";
import Dashboard from "./pages/dashboard/Dashboard";
import NotFound from "./pages/NotFound";
import NewRestaurant from "./pages/restaurants/NewRestaurant";
import BusinessDetails from "./pages/businesses/BusinessDetails";
import LandingPage from "./pages/LandingPage";
import BusinessMenuPage from "./pages/businesses/BusinessMenuPage";
import AiTestPage from "./pages/AiTestPage";

// Auth guard
import AuthGuard from "./components/auth/AuthGuard";

// Modifichiamo la struttura delle route

export const router = createBrowserRouter([
  // Route principale pubblica (landing page)
  {
    path: "/",
    element: <MainLayout />,
    children: [
      {
        index: true,
        element: <LandingPage />,
      },
      // Aggiungiamo la route pubblica per il test AI
      {
        path: "ai-test",
        element: <AiTestPage />,
      },
      // Altre pagine pubbliche (about, contatti, ecc.)
    ],
  },

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

  // App routes (protected)
  {
    path: "/dashboard",
    element: (
      <AuthGuard>
        <MainLayout />
      </AuthGuard>
    ),
    children: [
      {
        index: true,
        element: <Dashboard />,
      },
      // Nuove route per i ristoranti
      {
        path: "businesses/new",
        element: <NewRestaurant />,
      },
      // Route per i dettagli del business
      {
        path: "businesses/:id",
        element: <BusinessDetails />,
      },
      // Route per la gestione del menu
      {
        path: "businesses/:id/menu",
        element: <BusinessMenuPage />,
      },
    ],
  },

  // 404 page
  {
    path: "*",
    element: <NotFound />,
  },
]);
