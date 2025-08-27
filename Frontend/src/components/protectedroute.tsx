import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/authcontext";
import LoadingScreen from "@/pages/Utility/LoadingScreen";
import type { ReactNode } from "react";

interface RouteProps {
  children: ReactNode;
  redirectPath?: string;
}

// Protected Route Component - hanya bisa diakses setelah login
export const ProtectedRoute = ({ children, redirectPath = "/" }: RouteProps) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  if (!isAuthenticated) {
    return <Navigate to={redirectPath} replace />;
  }

  return <>{children}</>;
};

// Public Route Component - redirect ke main jika sudah login
export const PublicRoute = ({ children, redirectPath = "/main" }: RouteProps) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  if (isAuthenticated) {
    return <Navigate to={redirectPath} replace />;
  }

  return <>{children}</>;
};