import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { GraduationCap, Menu, X, LogIn, LayoutDashboard } from 'lucide-react';
import { PUBLIC_NAV_ITEMS } from '../../constants/menu.js';
import { useAuth } from '../../hooks/useAuth.jsx';
import { Button } from '../common/Button.jsx';

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const { isAuthenticated, user } = useAuth();

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200/80 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-11 h-11 rounded-xl bg-[#0B2E6B] text-[#F2B705] flex items-center justify-center shadow-md group-hover:scale-105 transition-transform duration-200">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <span className="font-heading font-extrabold text-lg sm:text-xl text-[#0B2E6B] tracking-tight block leading-tight">
                Portofolio<span className="text-[#F2B705]">Sekolah</span>
              </span>
              <span className="text-[11px] text-slate-500 font-medium tracking-wide uppercase block">
                Galeri Karya Siswa
              </span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-2">
            {PUBLIC_NAV_ITEMS.map((item) => {
              const active = isActive(item.path);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-150 ${
                    active
                      ? 'text-[#0B2E6B] bg-blue-50/80 font-semibold'
                      : 'text-slate-600 hover:text-[#0B2E6B] hover:bg-slate-50'
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Action Button */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <Link to="/admin">
                <Button variant="outline" size="sm" icon={LayoutDashboard}>
                  Panel Guru ({user?.name?.split(' ')[0] || 'Admin'})
                </Button>
              </Link>
            ) : (
              <Link to="/login">
                <Button variant="primary" size="sm" icon={LogIn}>
                  Login Guru
                </Button>
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              type="button"
              className="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 focus:outline-none"
              aria-label="Toggle Menu"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {isOpen && (
        <div className="md:hidden border-b border-slate-200 bg-white px-4 pt-2 pb-6 space-y-3 animate-in slide-in-from-top-4 duration-200 shadow-xl">
          <div className="space-y-1">
            {PUBLIC_NAV_ITEMS.map((item) => {
              const active = isActive(item.path);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsOpen(false)}
                  className={`block px-4 py-2.5 rounded-xl text-base font-medium ${
                    active
                      ? 'text-[#0B2E6B] bg-blue-50 font-bold'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>

          <div className="pt-3 border-t border-slate-100">
            {isAuthenticated ? (
              <Link to="/admin" onClick={() => setIsOpen(false)}>
                <Button variant="outline" size="md" className="w-full" icon={LayoutDashboard}>
                  Buka Panel Guru
                </Button>
              </Link>
            ) : (
              <Link to="/login" onClick={() => setIsOpen(false)}>
                <Button variant="primary" size="md" className="w-full" icon={LogIn}>
                  Login Guru
                </Button>
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

export default Navbar;
