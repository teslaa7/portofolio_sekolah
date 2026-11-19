import React, { useState, useRef } from 'react';
import { Save, Lock, Eye, EyeOff, AlertCircle, Camera, Trash2 } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth.jsx';
import { useToast } from '../../hooks/useToast.jsx';
import { authService } from '../../services/authService.js';
import { Input } from '../../components/common/Input.jsx';
import { Select } from '../../components/common/Select.jsx';
import { Button } from '../../components/common/Button.jsx';
import { useMajors } from '../../hooks/useMajors.js';
import {
  validateImageFile,
  fileToAvatarDataUrl,
  IMAGE_ACCEPT,
  MAX_FILE_SIZE_MB,
} from '../../utils/imageFile.js';

/** Avatar inisial nama sebagai fallback. */
function AvatarFallback({ name, size = 'lg' }) {
  const initials = (name || 'U')
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() || '')
    .join('');
  const cls = size === 'lg'
    ? 'w-24 h-24 text-2xl'
    : 'w-20 h-20 text-xl';
  return (
    <div className={`${cls} rounded-full bg-[#0B2E6B] text-white font-bold flex items-center justify-center shrink-0 select-none`}>
      {initials}
    </div>
  );
}

export function EditProfilePage() {
  const { user, updateProfile, isStudent } = useAuth();
  const toast   = useToast();
  const { majorNames } = useMajors();

  // ── Form Profil ───────────────────────────────────────────────────────────
  const [profileForm, setProfileForm] = useState({
    name:       user?.name       || '',
    class_name: user?.class_name || '',
    major:      user?.major      || '',
  });
  // avatar disimpan terpisah sebagai data URL (bukan di profileForm)
  const [avatarDataUrl, setAvatarDataUrl] = useState(user?.avatar || null);
  const [avatarChanged, setAvatarChanged] = useState(false); // apakah user mengubah foto

  const [profileErrors, setProfileErrors]       = useState({});
  const [avatarError, setAvatarError]           = useState(null);
  const [profileServerError, setProfileServerError] = useState('');
  const [savingProfile, setSavingProfile]       = useState(false);

  const avatarInputRef = useRef(null);

  // ── Form Password ─────────────────────────────────────────────────────────
  const [pwForm, setPwForm] = useState({
    current_password: '',
    new_password:     '',
    confirm_password: '',
  });
  const [pwErrors, setPwErrors]       = useState({});
  const [pwServerError, setPwServerError] = useState('');
  const [savingPw, setSavingPw]       = useState(false);
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew]         = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const majorOptions = majorNames.map((m) => ({ value: m, label: m }));

  // ── Avatar upload ─────────────────────────────────────────────────────────
  const handleAvatarFileChange = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = ''; // reset agar file yang sama bisa dipilih ulang
    if (!file) return;

    const { valid, error } = validateImageFile(file);
    if (!valid) {
      setAvatarError(error);
      return;
    }

    try {
      const dataUrl = await fileToAvatarDataUrl(file, 256, 0.85);
      setAvatarDataUrl(dataUrl);
      setAvatarChanged(true);
      setAvatarError(null);
    } catch (err) {
      setAvatarError(err.message || 'Gagal memproses foto. Coba file lain.');
    }
  };

  const handleRemoveAvatar = () => {
    setAvatarDataUrl(null);
    setAvatarChanged(true);
    setAvatarError(null);
  };

  // ── Profil form ───────────────────────────────────────────────────────────
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
    if (isStudent) {
      if (!profileForm.class_name.trim()) errs.class_name = 'Kelas wajib diisi';
      if (!profileForm.major)             errs.major      = 'Jurusan wajib dipilih';
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
      const payload = { name: profileForm.name.trim() };

      // Sertakan avatar hanya jika user mengubahnya
      if (avatarChanged) {
        payload.avatar = avatarDataUrl || '';   // kosong = hapus foto
      }

      if (isStudent) {
        payload.class_name = profileForm.class_name.trim();
        payload.major      = profileForm.major;
      }

      const res = await updateProfile(payload);
      if (res.success) {
        toast.success('Profil berhasil diperbarui.');
        setAvatarChanged(false);
      } else {
        setProfileServerError(res.message || 'Gagal memperbarui profil.');
      }
    } catch {
      setProfileServerError('Terjadi kesalahan jaringan.');
    } finally {
      setSavingProfile(false);
    }
  };

  // ── Password form ─────────────────────────────────────────────────────────
  const handlePwChange = (e) => {
    const { name, value } = e.target;
    setPwForm((p) => ({ ...p, [name]: value }));
    if (pwErrors[name]) setPwErrors((p) => ({ ...p, [name]: null }));
    if (pwServerError) setPwServerError('');
  };

  const validatePw = () => {
    const errs = {};
    if (!pwForm.current_password) errs.current_password = 'Password saat ini wajib diisi';
    if (!pwForm.new_password || pwForm.new_password.length < 8)
      errs.new_password = 'Password baru minimal 8 karakter';
    if (pwForm.new_password !== pwForm.confirm_password)
      errs.confirm_password = 'Konfirmasi password tidak cocok';
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

  return (
    <div className="max-w-2xl mx-auto space-y-8">

      {/* ── Kartu 1: Data Profil ──────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 sm:p-8 space-y-6">
        <div className="border-b border-slate-100 pb-4">
          <h2 className="text-lg font-bold text-[#0F172A] font-heading">Data Profil</h2>
          <p className="text-xs text-slate-500 mt-0.5">Perbarui nama, foto, dan informasi kelas.</p>
        </div>

        {/* ── Area foto profil ── */}
        <div className="flex items-center gap-5">
          {/* Input file tersembunyi */}
          <input
            ref={avatarInputRef}
            type="file"
            accept={IMAGE_ACCEPT}
            className="hidden"
            onChange={handleAvatarFileChange}
            aria-label="Upload foto profil"
          />

          {/* Lingkaran avatar + tombol kamera */}
          <div className="relative shrink-0">
            {avatarDataUrl ? (
              <img
                src={avatarDataUrl}
                alt={profileForm.name || user?.name}
                className="w-24 h-24 rounded-full object-cover border-2 border-[#F2B705] shadow"
                onError={(e) => { e.currentTarget.style.display = 'none'; }}
              />
            ) : (
              <AvatarFallback name={profileForm.name || user?.name} size="lg" />
            )}

            {/* Tombol kamera — overlay di sudut kanan bawah */}
            <button
              type="button"
              onClick={() => avatarInputRef.current?.click()}
              className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-[#0B2E6B] text-white flex items-center justify-center shadow-md hover:bg-[#1E40AF] transition-colors"
              title="Ganti foto profil"
              aria-label="Ganti foto profil"
            >
              <Camera className="w-4 h-4" />
            </button>
          </div>

          {/* Info + tombol aksi */}
          <div className="space-y-1.5 min-w-0">
            <p className="text-sm font-semibold text-slate-800 truncate">
              {profileForm.name || user?.name}
            </p>
            <p className="text-xs text-slate-500">
              {user?.role === 'admin' ? 'Admin Guru' : 'Murid'}
            </p>
            <div className="flex flex-wrap gap-2 pt-1">
              <button
                type="button"
                onClick={() => avatarInputRef.current?.click()}
                className="text-xs font-semibold text-[#0B2E6B] hover:underline"
              >
                {avatarDataUrl ? 'Ganti Foto' : 'Upload Foto'}
              </button>
              {avatarDataUrl && (
                <>
                  <span className="text-slate-300 text-xs">·</span>
                  <button
                    type="button"
                    onClick={handleRemoveAvatar}
                    className="text-xs font-semibold text-red-500 hover:underline"
                  >
                    Hapus Foto
                  </button>
                </>
              )}
            </div>
            <p className="text-[11px] text-slate-400">
              JPG, PNG, atau WebP — maks {MAX_FILE_SIZE_MB} MB
            </p>
          </div>
        </div>

        {/* Error upload foto */}
        {avatarError && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-2 text-xs text-rose-800">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
            <span>{avatarError}</span>
          </div>
        )}

        {/* Error server */}
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

          {/* Email read-only */}
          <Input
            label="Email (tidak dapat diubah)"
            type="email"
            value={user?.email || ''}
            disabled
            helperText="Email bersifat permanen dan tidak dapat diubah."
          />

          {/* Kelas & Jurusan — hanya murid */}
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

      {/* ── Kartu 2: Ubah Password ────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 sm:p-8 space-y-6">
        <div className="border-b border-slate-100 pb-4">
          <h2 className="text-lg font-bold text-[#0F172A] font-heading">Ubah Password</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Gunakan password yang kuat dan belum pernah dipakai sebelumnya.
          </p>
        </div>

        {pwServerError && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-2 text-xs text-rose-800">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
            <span>{pwServerError}</span>
          </div>
        )}

        <form onSubmit={handleChangePassword} className="space-y-4" noValidate>
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
