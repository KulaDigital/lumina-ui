import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'super_admin' | 'client';
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requiredRole }) => {
  const { session, userRole, authLoading, roleLoading } = useAuth();

  // Show spinner while either auth or role is loading
  if (authLoading || roleLoading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white z-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          <p className="mt-4 text-gray-700 font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  // Not authenticated - redirect to login
  if (!session) {
    return <Navigate to="/login" replace />;
  }

  // Authenticated but no role found (no dashboard_users row)
  // Show no-access with sign-out option instead of confusing login redirect
  if (!userRole) {
    return <Navigate to="/no-access?reason=no-role" replace />;
  }

  // Authenticated but role doesn't match - redirect to no access
  if (requiredRole && userRole.role !== requiredRole) {
    return <Navigate to="/no-access?reason=role-mismatch" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
