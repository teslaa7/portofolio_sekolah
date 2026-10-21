import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Layouts
import { PublicLayout } from '../components/layout/PublicLayout.jsx';
import { AdminLayout } from '../components/layout/AdminLayout.jsx';
import { ProtectedRoute } from './ProtectedRoute.jsx';

// Public Pages
import { HomePage } from '../pages/public/HomePage.jsx';
import { PortfolioListPage } from '../pages/public/PortfolioListPage.jsx';
import { PortfolioDetailPage } from '../pages/public/PortfolioDetailPage.jsx';
import { AboutPage } from '../pages/public/AboutPage.jsx';

// Auth Pages
import { LoginPage } from '../pages/auth/LoginPage.jsx';

// Admin Pages
import { DashboardPage } from '../pages/admin/DashboardPage.jsx';
import { ManagePortfolioPage } from '../pages/admin/ManagePortfolioPage.jsx';
import { AddPortfolioPage } from '../pages/admin/AddPortfolioPage.jsx';
import { EditPortfolioPage } from '../pages/admin/EditPortfolioPage.jsx';
import { ManageCategoryPage } from '../pages/admin/ManageCategoryPage.jsx';

export function AppRoutes() {
  return (
    <Routes>
      {/* Rute Publik */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/portofolio" element={<PortfolioListPage />} />
        <Route path="/portofolio/:slug" element={<PortfolioDetailPage />} />
        <Route path="/tentang" element={<AboutPage />} />
      </Route>

      {/* Rute Otentikasi */}
      <Route path="/login" element={<LoginPage />} />

      {/* Rute Terlindungi (Admin) */}
      <Route element={<ProtectedRoute />}>
        <Route element={<AdminLayout />}>
          <Route path="/admin" element={<DashboardPage />} />
          <Route path="/admin/portofolio" element={<ManagePortfolioPage />} />
          <Route path="/admin/portofolio/tambah" element={<AddPortfolioPage />} />
          <Route path="/admin/portofolio/:id/edit" element={<EditPortfolioPage />} />
          <Route path="/admin/kategori" element={<ManageCategoryPage />} />
        </Route>
      </Route>

      {/* Fallback 404 */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default AppRoutes;
