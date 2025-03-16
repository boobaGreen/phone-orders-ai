import { createBrowserRouter, Navigate } from "react-router-dom";

// Layouts
import MainLayout from "./components/layout/MainLayout";
import AuthLayout from "./components/layout/AuthLayout";

// Pages
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import AuthCallback from "./pages/auth/AuthCallback";
import Dashboard from "./pages/dashboard/Dashboard";
import BusinessList from "./pages/business/BusinessList";
import BusinessDetail from "./pages/business/BusinessDetail";
import BusinessCreate from "./pages/business/BusinessCreate";
import OrderList from "./pages/orders/OrderList";
import OrderDetail from "./pages/orders/OrderDetail";
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
        element: <Navigate to="/dashboard" />,
      },
      {
        path: "dashboard",
        element: <Dashboard />,
      },
      {
        path: "business",
        children: [
          {
            index: true,
            element: <BusinessList />,
          },
          {
            path: "new",
            element: <BusinessCreate />,
          },
          {
            path: ":id",
            element: <BusinessDetail />,
          },
        ],
      },
      {
        path: "orders",
        children: [
          {
            index: true,
            element: <OrderList />,
          },
          {
            path: ":id",
            element: <OrderDetail />,
          },
        ],
      },
    ],
  },

  // 404 page
  {
    path: "*",
    element: <NotFound />,
  },
]);
