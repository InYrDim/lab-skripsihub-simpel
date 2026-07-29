import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import type { UserRole } from '../types';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const { user, token, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return null;
  }

  if (!user || !token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && allowedRoles.length > 0) {
    const userRoleNormalized = user.role.toUpperCase();
    const isAllowed = allowedRoles.some(r => r.toUpperCase() === userRoleNormalized);

    if (!isAllowed) {
      // Redirect to user's authorized role home page
      if (userRoleNormalized === 'STUDENT') {
        return <Navigate to="/student" replace />;
      } else if (userRoleNormalized === 'ADMIN') {
        return <Navigate to="/admin" replace />;
      } else if (userRoleNormalized === 'VALIDATOR') {
        return <Navigate to="/validator" replace />;
      }
      return <Navigate to="/unauthorized" replace />;
    }
  }

  return <>{children}</>;
};

export const RoleBasedRedirect: React.FC = () => {
  const { user, token, loading } = useAuth();

  if (loading) {
    return null;
  }

  if (!user || !token) {
    return <Navigate to="/login" replace />;
  }

  const role = user.role.toUpperCase();
  if (role === 'ADMIN') {
    return <Navigate to="/admin" replace />;
  } else if (role === 'VALIDATOR') {
    return <Navigate to="/validator" replace />;
  }
  return <Navigate to="/student" replace />;
};
