import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

interface ProtectedRouteProps {
  children: React.ReactNode;
  role?: string;
}

export default function ProtectedRoute({ children, role }: ProtectedRouteProps) {
  const { user, loading } = useAuth();

  // ⛔ Block rendering until auth state is resolved
  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="flex items-center gap-3 text-blue-600 font-semibold">
          <span className="h-5 w-5 rounded-full border-2 border-blue-600 border-t-transparent animate-spin" />
          Loading dashboard...
        </div>
      </div>
    );
  }

  // 🔐 Not authenticated → login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // 🛡️ Role-based protection (case-safe)
  if (role && user.role?.toUpperCase() !== role.toUpperCase()) {
    return <Navigate to="/" replace />;
  }

  // ✅ Authorized
  return <>{children}</>;
}
