import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const ProtectedRoute = ({ 
  children, 
  allowedUserTypes = ['user', 'admin'], 
  redirectTo = '/login' 
}) => {
  const { isAuthenticated, userType, isLoading } = useAuth();
  const location = useLocation();

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  // Check if user type is allowed
  if (!allowedUserTypes.includes(userType)) {
    // Redirect to appropriate dashboard based on user type
    const redirectPath = userType === 'admin' ? '/procurement-dashboard' : '/user-dashboard';
    return <Navigate to={redirectPath} replace />;
  }

  // Render the protected component
  return children;
};

export default ProtectedRoute;
