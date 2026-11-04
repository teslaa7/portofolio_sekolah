import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { GraduationCap, Mail, Lock, LogIn, AlertCircle } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth.jsx';
import { useToast } from '../../hooks/useToast.jsx';
import { Input } from '../../components/common/Input.jsx';
import { Button } from '../../components/common/Button.jsx';
import { isValidEmail } from '../../utils/validators.js';

/** Halaman tujuan setelah login berdasarkan role. */
function getDefaultRedirect(role) {
  if (role === 'student') return '/admin/portofolio';
  return '/admin';
}

/**
 * Cek apakah `path` boleh diakses oleh `role`.
 * Murid hanya boleh ke rute portofolio, profil, dan ulasan.
 */
function isPathAllowedForRole(path, role) {
  if (role === 'student') {
    const forbidden = ['/admin', '/admin/kategori', '/admin/murid'];
    if (forbidden.includes(path)) return false;
    if (
      path.startsWith('/admin/portofolio') ||
      path === '/admin/profil' ||
      path === '/admin/ulasan'
    ) return true;
    return false;
  }
  return true; // admin boleh ke mana saja
}

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated, user } = useAuth();
  const toast = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [authError, setAuthError] = useState('');

  const from = location.state?.from?.pathname || null;

  // Jika sudah login, redirect ke halaman default role (bukan selalu /admin)
  React.useEffect(() => {
    if (isAuthenticated && user) {
      navigate(getDefaultRedirect(user.role), { replace: true });
    }
  }, [isAuthenticated, user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setAuthError('');

    const newErrors = {};
    if (!email.trim()) {
      newErrors.email = 'Email wajib diisi';
    } else if (!isValidEmail(email)) {
      newErrors.email = 'Format email tidak valid';
    }
    if (!password) {
      newErrors.password = 'Password wajib diisi';
    }
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    try {
      const res = await login(email, password);
      if (res.success) {
        toast.success(`Selamat datang, ${res.user.name}!`);
        const defaultPath = getDefaultRedirect(res.user.role);
        const targetPath =
          from && isPathAllowedForRole(from, res.user.role) ? from : defaultPath;
        navigate(targetPath, { replace: true });
      } else {
        setAuthError(res.message || 'Email atau password salah');
      }
    } catch {
      setAuthError('Terjadi kesalahan jaringan atau server');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F8FF] flex items-center justify-center px-4 py-12">
      {/* ── Satu kartu utama ── */}
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-slate-200/80 px-8 py-10 space-y-6">

        {/* Ikon brand + judul */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#0B2E6B] text-[#F2B705] shadow-lg">
            <GraduationCap className="w-8 h-8" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] font-heading">
            Masuk Panel Portofolio
          </h1>
          <p className="text-sm text-slate-500">
            Masukkan email dan password untuk mengakses panel.
          </p>
        </div>

        {/* Banner error dari server */}
        {authError && (
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-2.5 text-xs text-rose-800 font-medium">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <span>{authError}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <Input
            label="Email"
            type="email"
            name="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (errors.email) setErrors((p) => ({ ...p, email: null }));
            }}
            placeholder="email@sekolah.sch.id"
            leftIcon={Mail}
            error={errors.email}
            required
            autoComplete="email"
          />

          <Input
            label="Kata Sandi"
            type="password"
            name="password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              if (errors.password) setErrors((p) => ({ ...p, password: null }));
            }}
            placeholder="••••••••"
            leftIcon={Lock}
            error={errors.password}
            required
            autoComplete="current-password"
          />

          <Button
            type="submit"
            variant="primary"
            size="lg"
            className="w-full"
            icon={LogIn}
            isLoading={loading}
          >
            Masuk ke Panel
          </Button>
        </form>

        {/* Pemisah */}
        <div className="border-t border-slate-100" />

        {/* Tautan daftar */}
        <p className="text-center text-sm text-slate-500">
          Belum punya akun?{' '}
          <Link
            to="/daftar"
            className="font-semibold text-[#0B2E6B] hover:text-[#1E40AF] transition-colors"
          >
            Daftar sebagai murid
          </Link>
        </p>

        {/* Link kembali beranda */}
        <p className="text-center">
          <Link
            to="/"
            className="text-xs text-slate-400 hover:text-[#0B2E6B] transition-colors"
          >
            ← Kembali ke Beranda
          </Link>
        </p>
      </div>
    </div>
  );
}

export default LoginPage;
