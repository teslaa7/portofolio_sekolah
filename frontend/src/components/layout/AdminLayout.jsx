import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { AdminSidebar } from './AdminSidebar.jsx';
import { AdminHeader } from './AdminHeader.jsx';
import { useAuth } from '../../hooks/useAuth.jsx';

export function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const { isStudent } = useAuth();

  const getPageTitle = (path) => {
    if (path === '/admin') return 'Ringkasan Dashboard';
    if (path === '/admin/portofolio') return isStudent ? 'Karya Saya' : 'Kelola Portofolio Siswa';
    if (path === '/admin/portofolio/tambah') return 'Tambah Karya Baru';
    if (path.includes('/edit')) return 'Edit Data Portofolio';
    if (path === '/admin/kategori') return 'Kelola Kategori Portofolio';
    return 'Panel';
  };

  return (
    <div className="min-h-screen bg-[#F5F8FF]">
      <AdminSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="lg:pl-72 flex flex-col min-h-screen transition-all">
        <AdminHeader
          onOpenSidebar={() => setSidebarOpen(true)}
          pageTitle={getPageTitle(location.pathname)}
        />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default AdminLayout;
