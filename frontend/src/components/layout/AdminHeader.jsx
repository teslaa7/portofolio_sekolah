import React from 'react';
import { Menu, ExternalLink, LogOut, Plus } from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth.jsx';
import { useToast } from '../../hooks/useToast.jsx';
import { Button } from '../common/Button.jsx';

export function AdminHeader({ onOpenSidebar, pageTitle = 'Dashboard' }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();

  const handleLogout = async () => {
    await logout();
    toast.info('Anda telah keluar dari panel admin.');
    navigate('/login');
  };

  // Sembunyikan tombol "Tambah Portofolio" saat sudah berada di halaman form tambah
  const isOnAddPage = location.pathname === '/admin/portofolio/tambah';

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/80 h-20 px-4 sm:px-6 lg:px-8 flex items-center justify-between transition-all">
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenSidebar}
          type="button"
          className="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 lg:hidden"
          aria-label="Buka Menu"
        >
          <Menu className="w-6 h-6" />
        </button>

        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#0F172A] font-heading leading-tight">
            {pageTitle}
          </h1>
          <p className="text-xs text-slate-500 hidden sm:block">
            Panel Pengelolaan Karya & Portofolio Siswa
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        <Link to="/admin/portofolio/tambah" className={`hidden sm:inline-block${isOnAddPage ? ' invisible' : ''}`}>
          <Button variant="primary" size="sm" icon={Plus}>
            Tambah Portofolio
          </Button>
        </Link>

        <Link to="/" target="_blank" rel="noopener noreferrer" className="hidden md:inline-block">
          <Button variant="outline" size="sm" icon={ExternalLink}>
            Web Publik
          </Button>
        </Link>

        <div className="h-7 w-px bg-slate-200 hidden sm:block mx-1" />

        <div className="flex items-center gap-2.5 pl-1">
          <img
            src={user?.avatar || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=120&auto=format&fit=crop&q=80'}
            alt={user?.name || 'User'}
            className="w-9 h-9 rounded-full object-cover border border-slate-200"
          />
          <div className="hidden lg:block text-left">
            <span className="block text-xs font-semibold text-slate-800 leading-tight">
              {user?.name || 'Guru Admin'}
            </span>
            <span className="block text-[10px] text-slate-500 uppercase tracking-wider font-semibold">
              Admin Guru
            </span>
          </div>
        </div>

        <button
          onClick={handleLogout}
          type="button"
          title="Keluar"
          className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
        >
          <LogOut className="w-5 h-5" />
        </button>
      </div>
    </header>
  );
}

export default AdminHeader;
