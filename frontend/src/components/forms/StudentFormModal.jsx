import React, { useState, useEffect } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { Modal } from '../common/Modal.jsx';
import { Input } from '../common/Input.jsx';
import { Select } from '../common/Select.jsx';
import { Button } from '../common/Button.jsx';
import { MAJORS } from '../../constants/roles.js';

/**
 * Modal Tambah/Edit Murid.
 * @param {object|null} initialData - data murid untuk mode edit
 * @param {string} serverError - pesan error dari server (mis. 409 email duplikat)
 */
export function StudentFormModal({
  isOpen,
  onClose,
  onSubmit,
  initialData = null,
  isSubmitting = false,
  serverError = '',
}) {
  const isEdit = Boolean(initialData);
  const [form, setForm] = useState({
    name: '',
    email: '',
    class_name: '',
    major: MAJORS[0],
    password: '',
  });
  const [showPw, setShowPw] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isOpen) {
      setForm({
        name: initialData?.name || '',
        email: initialData?.email || '',
        class_name: initialData?.class_name || '',
        major: initialData?.major || MAJORS[0],
        password: '',
      });
      setErrors({});
      setShowPw(false);
    }
  }, [initialData, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: null }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = {};
    if (!form.name.trim() || form.name.trim().length < 2) errs.name = 'Nama minimal 2 karakter.';
    if (!form.email.trim()) errs.email = 'Email wajib diisi.';
    if (!form.class_name.trim()) errs.class_name = 'Kelas wajib diisi.';
    if (!form.major) errs.major = 'Jurusan wajib dipilih.';
    // Tambah: password wajib min 6. Edit: boleh kosong, tapi jika diisi min 6.
    if (!isEdit && (!form.password || form.password.length < 6)) errs.password = 'Password minimal 6 karakter.';
    if (form.password && form.password.length < 6) errs.password = 'Password minimal 6 karakter.';
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    const payload = {
      name: form.name.trim(),
      email: form.email.trim(),
      class_name: form.class_name.trim(),
      major: form.major,
    };
    if (form.password) payload.password = form.password;
    onSubmit(payload);
  };

  const majorOptions = MAJORS.map((m) => ({ value: m, label: m }));

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? 'Edit Data Murid' : 'Tambah Murid Baru'}
      maxWidth="max-w-md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Nama Lengkap"
          name="name"
          value={form.name}
          onChange={handleChange}
          placeholder="Nama murid"
          required
          error={errors.name}
        />

        <Input
          label="Email"
          name="email"
          type="email"
          value={form.email}
          onChange={handleChange}
          placeholder="murid@siswa.sch.id"
          required
          error={errors.email || (serverError ? serverError : undefined)}
        />

        <Input
          label="Kelas"
          name="class_name"
          value={form.class_name}
          onChange={handleChange}
          placeholder="Contoh: XII RPL 1"
          required
          error={errors.class_name}
        />

        <Select
          label="Jurusan"
          name="major"
          value={form.major}
          onChange={handleChange}
          options={majorOptions}
          required
          error={errors.major}
        />

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">
            Password {!isEdit && <span className="text-red-500">*</span>}
          </label>
          <div className="relative rounded-xl shadow-xs">
            <input
              type={showPw ? 'text' : 'password'}
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder={isEdit ? 'Kosongkan jika tidak ingin mengubah password' : 'Minimal 6 karakter'}
              className={`block w-full rounded-xl border bg-white py-2.5 pr-10 pl-3.5 text-sm text-[#0F172A] placeholder-slate-400 focus:outline-none focus:ring-2 ${
                errors.password
                  ? 'border-red-400 focus:ring-red-200'
                  : 'border-slate-300 focus:border-[#0B2E6B] focus:ring-blue-100'
              }`}
            />
            <button
              type="button"
              onClick={() => setShowPw((s) => !s)}
              className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600 transition-colors"
              aria-label="Tampilkan/sembunyikan password"
            >
              {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {errors.password ? (
            <p className="mt-1.5 text-xs text-[#DC2626] font-medium">{errors.password}</p>
          ) : isEdit ? (
            <p className="mt-1.5 text-xs text-slate-500">Kosongkan jika tidak ingin mengubah password.</p>
          ) : (
            <p className="mt-1.5 text-xs text-slate-500">Minimal 6 karakter.</p>
          )}
        </div>

        <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100">
          <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
            Batal
          </Button>
          <Button type="submit" variant="primary" isLoading={isSubmitting}>
            {isEdit ? 'Simpan' : 'Tambah'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

export default StudentFormModal;
