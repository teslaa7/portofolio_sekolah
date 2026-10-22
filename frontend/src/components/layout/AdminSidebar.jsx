import React from 'react';
import { NavLink, Link, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  FolderGit2,
  Tags,
  PlusCircle,
  ExternalLink,
  LogOut,
  GraduationCap,
  X,
  BookOpen,
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth.jsx';
import { useToast } from '../../hooks/useToast.jsx';

export function AdminSidebar({ isOpen, onClose }) {
  const { logout, user, isAdmin, isStudent } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();

  const handleLogout = async () => {
    await logout();
    toast.info('Anda telah keluar dari panel.');
    navigate('/login');
  };

  // Link logo menuju /admin/portofolio untuk murid, /admin untuk admin
  const homeLink = isStudent ? '/admin/portofolio' : '/admin';

  // Menu berdasarkan role
  const adminLinks = [
    { label: 'Dashboard', path: '/admin', icon: LayoutDashboard, end: true },
    {
      label: 'Kelola Portofolio',
      path: '/admin/portofolio',
      icon: FolderGit2,
      end: false,
      excludePaths: ['/admin/portofolio/tambah'],
    },
    { label: 'Tambah Portofolio', path: '/admin/portofolio/tambah', icon: PlusCircle, end: true },
    { label: 'Kelola Kategori', path: '/admin/kategori', icon: Tags, end: false },
  ];

  const studentLinks = [
    {
      label: 'Karya Saya',
      path: '/admin/portofolio',
      icon: BookOpen,
      end: false,
      excludePaths: ['/admin/portofolio/tambah'],
    },
    { label: 'Tambah Portofolio', path: '/admin/portofolio/tambah', icon: PlusCircle, end: true },
  ];

  const navLinks = isStudent ? studentLinks : adminLinks;

  const panelLabel = isStudent ? 'Panel Murid' : 'Panel Guru & Admin';

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-xs lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-72 bg-[#0B2E6B] text-white flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="h-20 flex items-center justify-between px-6 border-b border-blue-900/80">
          <Link to={homeLink} className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white text-[#0B2E6B] flex items-center justify-center shadow-md">
              <GraduationCap className="w-6 h-6 text-[#0B2E6B]" />
            </div>
            <div>
              <span className="font-heading font-extrabold text-base tracking-tight block">
                Portofolio<span className="text-[#F2B705]">Sekolah</span>
              </span>
              <span className="text-[10px] text-blue-200/80 uppercase font-semibold tracking-wider">
                {panelLabel}
              </span>
            </div>
          </Link>

          <button
            onClick={onClose}
            className="p-1 rounded-lg text-blue-200 hover:text-white hover:bg-blue-800 lg:hidden"
            aria-label="Tutup Menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User Card */}
        <div className="p-4 mx-4 my-4 rounded-xl bg-blue-900/50 border border-blue-800/60 flex items-center gap-3">
          <img
            src={
              user?.avatar ||
              'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=120&auto=format&fit=crop&q=80'
            }
            alt={user?.name || 'Pengguna'}
            className="w-10 h-10 rounded-full object-cover border-2 border-[#F2B705]"
          />
          <div className="overflow-hidden">
            <h5 className="text-sm font-semibold text-white truncate">{user?.name || 'Pengguna'}</h5>
            <p className="text-xs text-blue-200/80 truncate">{user?.email || ''}</p>
          </div>
        </div>

        {/* Main Navigation */}
        <div className="flex-1 overflow-y-auto px-4 py-2 space-y-1">
          <p className="px-3 text-[11px] font-semibold tracking-wider uppercase text-blue-300/70 mb-2">
            Menu Utama
          </p>
          {navLinks.map((item) => {
            const Icon = item.icon;
            const excluded = item.excludePaths?.includes(location.pathname) ?? false;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.end}
                onClick={onClose}
                className={({ isActive }) => {
                  const active = isActive && !excluded;
                  return `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                    active
                      ? 'bg-blue-800 text-white font-semibold shadow-inner'
                      : 'text-blue-100/80 hover:bg-blue-900/60 hover:text-white'
                  }`;
                }}
              >
                <Icon className="w-5 h-5 shrink-0 text-[#F2B705]" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </div>

        {/* Footer Navigation */}
        <div className="p-4 border-t border-blue-900/80 space-y-1.5">
          <Link
            to="/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium text-blue-100/80 hover:bg-blue-900/60 hover:text-white transition-colors"
          >
            <span className="flex items-center gap-3">
              <ExternalLink className="w-4 h-4 text-blue-300" />
              <span>Lihat Website</span>
            </span>
            <span className="text-[10px] bg-blue-800 text-blue-200 px-2 py-0.5 rounded-full font-semibold">
              Tab baru
            </span>
          </Link>

          <button
            onClick={handleLogout}
            type="button"
            className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-rose-300 hover:bg-rose-900/30 hover:text-rose-200 transition-colors text-left"
          >
            <LogOut className="w-4 h-4 shrink-0 text-rose-400" />
            <span>Keluar (Logout)</span>
          </button>
        </div>
      </aside>
    </>
  );
}

export default AdminSidebar;
