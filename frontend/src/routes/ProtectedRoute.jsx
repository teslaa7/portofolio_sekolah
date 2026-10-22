import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.jsx';
import { useToast } from '../hooks/useToast.jsx';
import { LoadingSpinner } from '../components/common/LoadingSkeleton.jsx';

/**
 * Melindungi rute admin. Mendukung prop allowedRoles untuk pembatasan per-role.
 * @param {string[]} allowedRoles - jika diisi, hanya role yang tertera yang boleh masuk.
 */
export function ProtectedRoute({ allowedRoles = [] }) {
  const { isAuthenticated, isLoading, user } = useAuth();
  const location = useLocation();
  const toast = useToast();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F5F8FF]">
        <LoadingSpinner text="Memeriksa sesi pengguna..." />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Cek role bila allowedRoles diberikan
  if (allowedRoles.length > 0 && !allowedRoles.includes(user?.role)) {
    // Arahkan ke halaman default sesuai role
    const defaultPath = user?.role === 'student' ? '/admin/portofolio' : '/admin';
    toast.error('Anda tidak memiliki akses ke halaman tersebut.');
    return <Navigate to={defaultPath} replace />;
  }

  return <Outlet />;
}

export default ProtectedRoute;
