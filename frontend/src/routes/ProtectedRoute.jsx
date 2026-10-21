import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.jsx';
import { LoadingSpinner } from '../components/common/LoadingSkeleton.jsx';

/**
 * ProtectedRoute component
 * Melindungi rute admin, mewajibkan sesi login aktif
 */
export function ProtectedRoute() {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F5F8FF]">
        <LoadingSpinner text="Memeriksa otentikasi guru..." />
      </div>
    );
  }

  if (!isAuthenticated) {
    // Redirect ke login dengan menyimpan rute asal
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
}

export default ProtectedRoute;
