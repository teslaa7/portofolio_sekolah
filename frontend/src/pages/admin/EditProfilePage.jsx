import React, { useState } from 'react';
import { Save, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth.jsx';
import { useToast } from '../../hooks/useToast.jsx';
import { authService } from '../../services/authService.js';
import { Input } from '../../components/common/Input.jsx';
import { Select } from '../../components/common/Select.jsx';
import { Button } from '../../components/common/Button.jsx';
import { MAJORS } from '../../constants/roles.js';
import { isValidUrl } from '../../utils/validators.js';

/** Avatar fallback: inisial nama dalam lingkaran berwarna. */
function AvatarFallback({ name }) {
  const initials = (name || 'U')
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() || '')
    .join('');
  return (
    <div className="w-20 h-20 rounded-full bg-[#0B2E6B] text-white text-2xl font-bold flex items-center justify-center shrink-0 select-none">
      {initials}
    </div>
  );
}

export function EditProfilePage() {
  const { user, updateProfile, isStudent } = useAuth();
  const toast = useToast();

  // ── Form Profil ──────────────────────────────────────────────────────────
  const [profileForm, setProfileForm] = useState({
    name:       user?.name || '',
    avatar:     user?.avatar || '',
    class_name: user?.class_name || '',
    major:      user?.major || '',
  });
  const [profileErrors, setProfileErrors] = useState({});
  const [profileServerError, setProfileServerError] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);

  // ── Form Password ────────────────────────────────────────────────────────
  const [pwForm, setPwForm] = useState({
    current_password: '',
    new_password: '',
    confirm_password: '',
  });
  const [pwErrors, setPwErrors]               = useState({});
  const [pwServerError, setPwServerError]     = useState('');
  const [savingPw, setSavingPw]               = useState(false);
  const [showCurrent, setShowCurrent]         = useState(false);
  const [showNew, setShowNew]                 = useState(false);
  const [showConfirm, setShowConfirm]         = useState(false);

  const majorOptions = MAJORS.map((m) => ({ value: m, label: m }));

  // ── Handle perubahan input profil ────────────────────────────────────────
  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileForm((p) => ({ ...p, [name]: value }));
    if (profileErrors[name]) setProfileErrors((p) => ({ ...p, [name]: null }));
    if (profileServerError) setProfileServerError('');
  };

  const validateProfile = () => {
    const errs = {};
    if (!profileForm.name.trim() || profileForm.name.trim().length < 2) {
      errs.name = 'Nama minimal 2 karakter';
    }
    if (profileForm.avatar && !isValidUrl(profileForm.avatar)) {
      errs.avatar = 'URL foto harus diawali http:// atau https://';
    }
    if (isStudent) {
      if (!profileForm.class_name.trim()) errs.class_name = 'Kelas wajib diisi';
      if (!profileForm.major) errs.major = 'Jurusan wajib dipilih';
    }
    return errs;
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setProfileServerError('');
    const errs = validateProfile();
    if (Object.keys(errs).length > 0) { setProfileErrors(errs); return; }

    setSavingProfile(true);
    try {
      const payload = { name: profileForm.name.trim(), avatar: profileForm.avatar.trim() };
      if (isStudent) {
        payload.class_name = profileForm.class_name.trim();
        payload.major      = profileForm.major;
      }
      const res = await updateProfile(payload);
      if (res.success) {
        toast.success('Profil berhasil diperbarui.');
      } else {
        setProfileServerError(res.message || 'Gagal memperbarui profil.');
      }
    } catch {
      setProfileServerError('Terjadi kesalahan jaringan.');
    } finally {
      setSavingProfile(false);
    }
  };

  // ── Handle perubahan input password ─────────────────────────────────────
  const handlePwChange = (e) => {
    const { name, value } = e.target;
    setPwForm((p) => ({ ...p, [name]: value }));
    if (pwErrors[name]) setPwErrors((p) => ({ ...p, [name]: null }));
    if (pwServerError) setPwServerError('');
  };

  const validatePw = () => {
    const errs = {};
    if (!pwForm.current_password) errs.current_password = 'Password saat ini wajib diisi';
    if (!pwForm.new_password || pwForm.new_password.length < 8) {
      errs.new_password = 'Password baru minimal 8 karakter';
    }
    if (pwForm.new_password !== pwForm.confirm_password) {
      errs.confirm_password = 'Konfirmasi password tidak cocok';
    }
    return errs;
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPwServerError('');
    const errs = validatePw();
    if (Object.keys(errs).length > 0) { setPwErrors(errs); return; }

    setSavingPw(true);
    try {
      const res = await authService.changePassword({
        current_password: pwForm.current_password,
        new_password:     pwForm.new_password,
      });
      if (res.success) {
        toast.success('Password berhasil diubah.');
        setPwForm({ current_password: '', new_password: '', confirm_password: '' });
      } else {
        setPwServerError(res.message || 'Gagal mengubah password.');
      }
    } catch {
      setPwServerError('Terjadi kesalahan jaringan.');
    } finally {
      setSavingPw(false);
    }
  };

  // Avatar yang ditampilkan: pakai preview dari field form jika valid
  const avatarSrc = profileForm.avatar && isValidUrl(profileForm.avatar) ? profileForm.avatar : null;

  return (
    <div className="max-w-2xl mx-auto space-y-8">

      {/* ── Kartu 1: Data Profil ─────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 sm:p-8 space-y-6">
        <div className="border-b border-slate-100 pb-4">
          <h2 className="text-lg font-bold text-[#0F172A] font-heading">Data Profil</h2>
          <p className="text-xs text-slate-500 mt-0.5">Perbarui nama, foto, dan informasi kelas.</p>
        </div>

        {/* Preview avatar */}
        <div className="flex items-center gap-5">
          {avatarSrc ? (
            <img
              src={avatarSrc}
              alt={user?.name}
              className="w-20 h-20 rounded-full object-cover border-2 border-[#F2B705] shadow"
              onError={(e) => { e.currentTarget.style.display = 'none'; }}
            />
          ) : (
            <AvatarFallback name={profileForm.name || user?.name} />
          )}
          <div>
            <p className="text-sm font-semibold text-slate-800">{user?.name}</p>
            <p className="text-xs text-slate-500 capitalize">{user?.role === 'admin' ? 'Admin Guru' : 'Murid'}</p>
          </div>
        </div>

        {profileServerError && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-2 text-xs text-rose-800">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
            <span>{profileServerError}</span>
          </div>
        )}

        <form onSubmit={handleSaveProfile} className="space-y-4" noValidate>
          <Input
            label="Nama Lengkap"
            name="name"
            value={profileForm.name}
            onChange={handleProfileChange}
            error={profileErrors.name}
            required
          />

          {/* Email: read-only */}
          <Input
            label="Email (tidak dapat diubah)"
            type="email"
            value={user?.email || ''}
            disabled
            helperText="Email bersifat permanen dan tidak dapat diubah."
          />

          <Input
            label="URL Foto Profil (opsional)"
            name="avatar"
            value={profileForm.avatar}
            onChange={handleProfileChange}
            placeholder="https://contoh.com/foto.jpg"
            error={profileErrors.avatar}
            helperText="Kosongkan untuk menggunakan inisial nama."
          />

          {/* Hanya murid: kelas & jurusan */}
          {isStudent && (
            <>
              <Input
                label="Kelas"
                name="class_name"
                value={profileForm.class_name}
                onChange={handleProfileChange}
                placeholder="Contoh: XII RPL 1"
                error={profileErrors.class_name}
                required
              />
              <Select
                label="Jurusan Keahlian"
                name="major"
                value={profileForm.major}
                onChange={handleProfileChange}
                options={majorOptions}
                placeholder="Pilih jurusan..."
                error={profileErrors.major}
                required
              />
            </>
          )}

          <Button type="submit" variant="primary" size="md" icon={Save} isLoading={savingProfile}>
            Simpan Perubahan
          </Button>
        </form>
      </div>

      {/* ── Kartu 2: Ubah Password ───────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 sm:p-8 space-y-6">
        <div className="border-b border-slate-100 pb-4">
          <h2 className="text-lg font-bold text-[#0F172A] font-heading">Ubah Password</h2>
          <p className="text-xs text-slate-500 mt-0.5">Gunakan password yang kuat dan belum pernah dipakai sebelumnya.</p>
        </div>

        {pwServerError && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-2 text-xs text-rose-800">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
            <span>{pwServerError}</span>
          </div>
        )}

        <form onSubmit={handleChangePassword} className="space-y-4" noValidate>
          {/* Password saat ini */}
          <div className="relative">
            <Input
              label="Password Saat Ini"
              name="current_password"
              type={showCurrent ? 'text' : 'password'}
              value={pwForm.current_password}
              onChange={handlePwChange}
              error={pwErrors.current_password}
              leftIcon={Lock}
              required
              autoComplete="current-password"
            />
            <button type="button" onClick={() => setShowCurrent((v) => !v)}
              className="absolute right-3 top-[2.1rem] text-slate-400 hover:text-slate-600"
              aria-label="Tampilkan password">
              {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          {/* Password baru */}
          <div className="relative">
            <Input
              label="Password Baru (min. 8 karakter)"
              name="new_password"
              type={showNew ? 'text' : 'password'}
              value={pwForm.new_password}
              onChange={handlePwChange}
              error={pwErrors.new_password}
              leftIcon={Lock}
              required
              autoComplete="new-password"
            />
            <button type="button" onClick={() => setShowNew((v) => !v)}
              className="absolute right-3 top-[2.1rem] text-slate-400 hover:text-slate-600"
              aria-label="Tampilkan password">
              {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          {/* Konfirmasi password baru */}
          <div className="relative">
            <Input
              label="Konfirmasi Password Baru"
              name="confirm_password"
              type={showConfirm ? 'text' : 'password'}
              value={pwForm.confirm_password}
              onChange={handlePwChange}
              error={pwErrors.confirm_password}
              leftIcon={Lock}
              required
              autoComplete="new-password"
            />
            <button type="button" onClick={() => setShowConfirm((v) => !v)}
              className="absolute right-3 top-[2.1rem] text-slate-400 hover:text-slate-600"
              aria-label="Tampilkan password">
              {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          <Button type="submit" variant="primary" size="md" icon={Lock} isLoading={savingPw}>
            Ubah Password
          </Button>
        </form>
      </div>
    </div>
  );
}

export default EditProfilePage;
