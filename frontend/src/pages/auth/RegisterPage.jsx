import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  GraduationCap,
  Mail,
  Lock,
  User,
  BookOpen,
  AlertCircle,
  ArrowLeft,
  UserPlus,
  Eye,
  EyeOff,
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth.jsx';
import { useToast } from '../../hooks/useToast.jsx';
import { Input } from '../../components/common/Input.jsx';
import { Select } from '../../components/common/Select.jsx';
import { Button } from '../../components/common/Button.jsx';
import { MAJORS } from '../../constants/roles.js';
import { validateRegisterForm } from '../../utils/validators.js';

export function RegisterPage() {
  const navigate = useNavigate();
  const { register, isAuthenticated, user } = useAuth();
  const toast = useToast();

  // Jika sudah login, redirect ke halaman default role
  React.useEffect(() => {
    if (isAuthenticated && user) {
      const dest = user.role === 'student' ? '/admin/portofolio' : '/admin';
      navigate(dest, { replace: true });
    }
  }, [isAuthenticated, user, navigate]);

  const [form, setForm] = useState({
    name: '',
    email: '',
    class_name: '',
    major: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const majorOptions = MAJORS.map((m) => ({ value: m, label: m }));

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: null }));
    if (serverError) setServerError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');

    const { isValid, errors: validationErrors } = validateRegisterForm(form);
    if (!isValid) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);
    try {
      const res = await register({
        name: form.name.trim(),
        email: form.email.trim(),
        class_name: form.class_name.trim(),
        major: form.major,
        password: form.password,
      });

      if (res.success) {
        toast.success('Akun berhasil dibuat. Selamat datang!');
        navigate('/admin/portofolio', { replace: true });
      } else {
        setServerError(res.message || 'Pendaftaran gagal. Silakan coba lagi.');
      }
    } catch {
      setServerError('Terjadi kesalahan jaringan atau server.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F8FF] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md px-4">
        {/* Back to Home */}
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
            Daftar Akun Murid
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Buat akun untuk mengelola dan mempublikasikan karya portofoliomu.
          </p>
        </div>

        {/* Form Card */}
        <div className="mt-8 bg-white py-8 px-6 sm:px-10 shadow-xl rounded-3xl border border-slate-200/80">
          {/* Server error banner */}
          {serverError && (
            <div className="mb-5 p-3.5 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-2.5 text-xs text-rose-800 font-medium">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{serverError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            {/* Nama */}
            <Input
              label="Nama Lengkap"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Nama kamu seperti di rapor"
              leftIcon={User}
              error={errors.name}
              required
              autoComplete="name"
            />

            {/* Email */}
            <Input
              label="Email"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              placeholder="email@siswa.sch.id"
              leftIcon={Mail}
              error={errors.email}
              required
              autoComplete="email"
            />

            {/* Kelas */}
            <Input
              label="Kelas"
              name="class_name"
              value={form.class_name}
              onChange={handleChange}
              placeholder="Contoh: XII RPL 1"
              leftIcon={BookOpen}
              error={errors.class_name}
              required
              autoComplete="off"
            />

            {/* Jurusan */}
            <Select
              label="Jurusan Keahlian"
              name="major"
              value={form.major}
              onChange={handleChange}
              options={majorOptions}
              placeholder="Pilih jurusan..."
              error={errors.major}
              required
            />

            {/* Password */}
            <div className="relative">
              <Input
                label="Kata Sandi"
                name="password"
                type={showPassword ? 'text' : 'password'}
                value={form.password}
                onChange={handleChange}
                placeholder="Minimal 8 karakter"
                leftIcon={Lock}
                error={errors.password}
                required
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-[2.1rem] text-slate-400 hover:text-slate-600 transition-colors"
                aria-label={showPassword ? 'Sembunyikan password' : 'Tampilkan password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {/* Konfirmasi Password */}
            <div className="relative">
              <Input
                label="Konfirmasi Kata Sandi"
                name="confirmPassword"
                type={showConfirm ? 'text' : 'password'}
                value={form.confirmPassword}
                onChange={handleChange}
                placeholder="Ulangi kata sandi"
                leftIcon={Lock}
                error={errors.confirmPassword}
                required
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowConfirm((v) => !v)}
                className="absolute right-3 top-[2.1rem] text-slate-400 hover:text-slate-600 transition-colors"
                aria-label={showConfirm ? 'Sembunyikan password' : 'Tampilkan password'}
              >
                {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full mt-2"
              icon={UserPlus}
              isLoading={loading}
            >
              Buat Akun Murid
            </Button>
          </form>

          {/* Link ke Login */}
          <p className="mt-6 text-center text-sm text-slate-500">
            Sudah punya akun?{' '}
            <Link
              to="/login"
              className="font-semibold text-[#0B2E6B] hover:text-[#1E40AF] transition-colors"
            >
              Masuk di sini
            </Link>
          </p>
        </div>

        <p className="mt-6 text-center text-xs text-slate-400">
          Sistem Galeri Portofolio Sekolah • Pendaftaran Murid
        </p>
      </div>
    </div>
  );
}

export default RegisterPage;
