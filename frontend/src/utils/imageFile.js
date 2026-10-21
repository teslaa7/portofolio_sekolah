/**
 * Utilitas untuk validasi dan konversi file gambar.
 * Dipakai di PortfolioForm untuk upload thumbnail & screenshot.
 */

/** Format yang diterima sebagai input file */
export const IMAGE_ACCEPT = 'image/jpeg,image/png,image/webp';

/** Ukuran file maksimum dalam MB */
export const MAX_FILE_SIZE_MB = 5;

/**
 * Validasi file gambar berdasarkan tipe MIME dan ukuran.
 * @param {File} file
 * @returns {{ valid: boolean, error: string | null }}
 */
export function validateImageFile(file) {
  if (!file) return { valid: false, error: 'Tidak ada file dipilih.' };

  const allowedTypes = IMAGE_ACCEPT.split(',');
  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: `Format tidak didukung. Gunakan JPG, PNG, atau WebP.`,
    };
  }

  const maxBytes = MAX_FILE_SIZE_MB * 1024 * 1024;
  if (file.size > maxBytes) {
    return {
      valid: false,
      error: `Ukuran file terlalu besar (maks ${MAX_FILE_SIZE_MB} MB). File ini ${(file.size / 1024 / 1024).toFixed(1)} MB.`,
    };
  }

  return { valid: true, error: null };
}

/**
 * Mengkonversi File ke data URL.
 * Mengembalikan string "data:image/..." yang bisa langsung dipakai sebagai src <img>.
 * @param {File} file
 * @returns {Promise<string>}
 */
export function fileToOptimizedDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target.result);
    reader.onerror = () => reject(new Error('Gagal membaca file gambar.'));
    reader.readAsDataURL(file);
  });
}
