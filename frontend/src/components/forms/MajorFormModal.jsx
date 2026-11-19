import React, { useState, useEffect } from 'react';
import { AlertTriangle } from 'lucide-react';
import { Modal } from '../common/Modal.jsx';
import { Input } from '../common/Input.jsx';
import { Button } from '../common/Button.jsx';

export function MajorFormModal({
  isOpen,
  onClose,
  onSubmit,
  initialData = null,
  isSubmitting = false,
}) {
  const isEdit = Boolean(initialData);

  const [name, setName]               = useState('');
  const [code, setCode]               = useState('');
  const [description, setDescription] = useState('');
  const [errors, setErrors]           = useState({});

  useEffect(() => {
    if (initialData) {
      setName(initialData.name || '');
      setCode(initialData.code || '');
      setDescription(initialData.description || '');
    } else {
      setName('');
      setCode('');
      setDescription('');
    }
    setErrors({});
  }, [initialData, isOpen]);

  const validate = () => {
    const e = {};
    if (!name.trim() || name.trim().length < 2) e.name = 'Nama jurusan minimal 2 karakter.';
    if (name.trim().length > 100) e.name = 'Nama jurusan maksimal 100 karakter.';
    if (code.trim().length > 20) e.code = 'Kode jurusan maksimal 20 karakter.';
    if (description.trim().length > 300) e.description = 'Deskripsi maksimal 300 karakter.';
    return e;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    onSubmit({
      name: name.trim(),
      code: code.trim().toUpperCase(),
      description: description.trim(),
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? 'Edit Jurusan' : 'Tambah Jurusan Baru'}
      maxWidth="max-w-lg"
    >
      {/* Peringatan di mode edit */}
      {isEdit && (
        <div className="mb-4 p-3 rounded-xl bg-amber-50 border border-amber-200 flex items-start gap-2.5 text-xs text-amber-800">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <span>
            <strong>Perhatian:</strong> Mengganti nama jurusan akan ikut mengubah data murid &amp; karya yang memakai jurusan ini.
          </span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Nama Jurusan"
          value={name}
          onChange={(e) => { setName(e.target.value); setErrors((p) => ({ ...p, name: null })); }}
          placeholder="Contoh: Rekayasa Perangkat Lunak (RPL)"
          required
          error={errors.name}
        />

        <Input
          label="Kode Jurusan (Opsional)"
          value={code}
          onChange={(e) => { setCode(e.target.value); setErrors((p) => ({ ...p, code: null })); }}
          placeholder="Contoh: RPL"
          helperText="Singkatan, maks 20 karakter. Akan diubah ke huruf kapital."
          error={errors.code}
        />

        <div>
          <div className="flex justify-between items-center mb-1.5">
            <label className="block text-sm font-medium text-slate-700">Deskripsi (Opsional)</label>
            <span className={`text-xs ${description.length > 300 ? 'text-red-600 font-bold' : 'text-slate-400'}`}>
              {description.length} / 300
            </span>
          </div>
          <textarea
            rows={3}
            value={description}
            onChange={(e) => { setDescription(e.target.value); setErrors((p) => ({ ...p, description: null })); }}
            placeholder="Deskripsi singkat bidang keahlian jurusan ini..."
            className={`block w-full rounded-xl border bg-white p-3 text-sm text-[#0F172A] placeholder-slate-400 focus:outline-none focus:ring-2 ${
              errors.description
                ? 'border-red-400 focus:ring-red-200'
                : 'border-slate-300 focus:border-[#0B2E6B] focus:ring-blue-100'
            }`}
          />
          {errors.description && (
            <p className="mt-1 text-xs text-red-600 font-medium">{errors.description}</p>
          )}
        </div>

        <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100">
          <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
            Batal
          </Button>
          <Button type="submit" variant="primary" isLoading={isSubmitting}>
            {isEdit ? 'Simpan Perubahan' : 'Tambah Jurusan'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

export default MajorFormModal;
