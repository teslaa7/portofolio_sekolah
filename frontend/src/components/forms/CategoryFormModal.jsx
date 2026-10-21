import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal.jsx';
import { Input } from '../common/Input.jsx';
import { Button } from '../common/Button.jsx';
import { slugify } from '../../utils/slugify.js';

export function CategoryFormModal({
  isOpen,
  onClose,
  onSubmit,
  initialData = null,
  isSubmitting = false,
}) {
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [autoSlug, setAutoSlug] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (initialData) {
      setName(initialData.name || '');
      setSlug(initialData.slug || '');
      setAutoSlug(false);
    } else {
      setName('');
      setSlug('');
      setAutoSlug(true);
    }
    setError('');
  }, [initialData, isOpen]);

  const handleNameChange = (e) => {
    const val = e.target.value;
    setName(val);
    if (autoSlug) {
      setSlug(slugify(val));
    }
  };

  const handleSlugChange = (e) => {
    setAutoSlug(false);
    setSlug(slugify(e.target.value));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Nama kategori wajib diisi.');
      return;
    }
    onSubmit({
      name: name.trim(),
      slug: slug || slugify(name),
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? 'Edit Kategori' : 'Tambah Kategori Baru'}
      maxWidth="max-w-md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Nama Kategori"
          value={name}
          onChange={handleNameChange}
          placeholder="Contoh: Aplikasi Mobile/PWA"
          required
          error={error}
        />

        <Input
          label="Slug (URL Ramah)"
          value={slug}
          onChange={handleSlugChange}
          placeholder="aplikasi-mobile-pwa"
          helperText="Digunakan pada URL rujukan kategori."
        />

        <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100">
          <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
            Batal
          </Button>
          <Button type="submit" variant="primary" isLoading={isSubmitting}>
            {initialData ? 'Simpan' : 'Tambah'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

export default CategoryFormModal;
