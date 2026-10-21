/**
 * Kumpulan fungsi validasi form
 */

export function isValidUrl(url) {
  if (!url) return false;
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

export function isValidEmail(email) {
  if (!email) return false;
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}

export function validatePortfolioForm(formData) {
  const errors = {};

  if (!formData.title || !formData.title.trim()) {
    errors.title = 'Judul karya wajib diisi';
  }

  if (!formData.student_name || !formData.student_name.trim()) {
    errors.student_name = 'Nama murid/tim wajib diisi';
  }

  if (!formData.class_name || !formData.class_name.trim()) {
    errors.class_name = 'Kelas wajib diisi';
  }

  if (!formData.major) {
    errors.major = 'Jurusan wajib dipilih';
  }

  if (!formData.category_id) {
    errors.category_id = 'Kategori wajib dipilih';
  }

  if (!formData.short_description || !formData.short_description.trim()) {
    errors.short_description = 'Deskripsi singkat wajib diisi';
  } else if (formData.short_description.length > 150) {
    errors.short_description = 'Deskripsi singkat maksimal 150 karakter';
  }

  if (!formData.description || !formData.description.trim()) {
    errors.description = 'Deskripsi lengkap wajib diisi';
  }

  if (!formData.year) {
    errors.year = 'Tahun wajib diisi';
  }

  if (formData.project_url && !isValidUrl(formData.project_url)) {
    errors.project_url = 'URL proyek harus berupa URL valid (http:// atau https://)';
  }

  if (formData.repo_url && !isValidUrl(formData.repo_url)) {
    errors.repo_url = 'URL repository harus berupa URL valid (http:// atau https://)';
  }

  if (formData.thumbnail_url && !isValidUrl(formData.thumbnail_url) && !formData.thumbnail_url.startsWith('data:image/')) {
    errors.thumbnail_url = 'URL thumbnail harus berupa URL gambar yang valid';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}
