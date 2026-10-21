import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { GraduationCap, Mail, Lock, LogIn, KeyRound, AlertCircle, ArrowLeft } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth.jsx';
import { useToast } from '../../hooks/useToast.jsx';
import { Input } from '../../components/common/Input.jsx';
import { Button } from '../../components/common/Button.jsx';
import { isValidEmail } from '../../utils/validators.js';

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated } = useAuth();
  const toast = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [authError, setAuthError] = useState('');

  // Destination after successful login
  const from = location.state?.from?.pathname || '/admin';

  // If already authenticated, redirect to /admin
  React.useEffect(() => {
    if (isAuthenticated) {
      navigate('/admin', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleAutofillDemo = () => {
    setEmail('admin@sekolah.sch.id');
    setPassword('admin123');
    setErrors({});
    setAuthError('');
  };

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
        toast.success(`Selamat datang kembali, ${res.user.name}!`);
        navigate(from, { replace: true });
      } else {
        setAuthError(res.message || 'Email atau password salah');
      }
    } catch (err) {
      setAuthError('Terjadi kesalahan jaringan atau server');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F8FF] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md px-4">
        {/* Back to Home Link */}
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-[#0B2E6B] mb-6 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Kembali ke Beranda Publik</span>
        </Link>

        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#0B2E6B] text-[#F2B705] shadow-lg mb-2">
            <GraduationCap className="w-8 h-8" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] font-heading">
            Masuk Panel Guru
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Akses kurasi, kelola portofolio karya, dan atur kategori sekolah.
          </p>
        </div>

        {/* Demo Credentials Box */}
        <div className="mt-6 bg-amber-50/80 border border-amber-200/90 rounded-2xl p-4 text-xs text-amber-900 shadow-xs">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="font-bold flex items-center gap-1.5 text-amber-800">
                <KeyRound className="w-4 h-4 text-amber-600" />
                <span>Akun Demo Guru (Admin):</span>
              </p>
              <p className="mt-1 font-mono text-[11px] text-slate-700">
                Email: <span className="font-bold text-[#0B2E6B]">admin@sekolah.sch.id</span>
                <br />
                Password: <span className="font-bold text-[#0B2E6B]">admin123</span>
              </p>
            </div>
            <button
              type="button"
              onClick={handleAutofillDemo}
              className="px-2.5 py-1.5 rounded-lg bg-amber-200 hover:bg-amber-300 font-semibold text-amber-900 text-[11px] transition-colors shrink-0 shadow-xs cursor-pointer"
            >
              Isi Otomatis
            </button>
          </div>
        </div>

        {/* Card Form */}
        <div className="mt-6 bg-white py-8 px-6 sm:px-10 shadow-xl rounded-3xl border border-slate-200/80">
          {authError && (
            <div className="mb-6 p-3.5 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-2.5 text-xs text-rose-800 font-medium">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{authError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              label="Email Guru / Administrator"
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (errors.email) setErrors((prev) => ({ ...prev, email: null }));
              }}
              placeholder="admin@sekolah.sch.id"
              leftIcon={Mail}
              error={errors.email}
              required
            />

            <Input
              label="Kata Sandi (Password)"
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (errors.password) setErrors((prev) => ({ ...prev, password: null }));
              }}
              placeholder="••••••••"
              leftIcon={Lock}
              error={errors.password}
              required
            />

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full mt-2"
              icon={LogIn}
              isLoading={loading}
            >
              Masuk ke Dashboard
            </Button>
          </form>
        </div>

        <p className="mt-6 text-center text-xs text-slate-400">
          Sistem Galeri Portofolio Sekolah • Akses Khusus Guru & Tenaga Kependidikan
        </p>
      </div>
    </div>
  );
}

export default LoginPage;
