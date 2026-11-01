/**
 * Utilitas untuk validasi dan konversi file gambar.
 * Dipakai di PortfolioForm untuk upload thumbnail & screenshot.
 */

/** Format yang diterima sebagai input file */
export const IMAGE_ACCEPT = 'image/jpeg,image/png,image/webp';

/** Ukuran file input maksimum dalam MB (sebelum dikompres) */
export const MAX_FILE_SIZE_MB = 5;

/** Panjang data URL maksimum (~1 MB) hasil kompresi */
const MAX_DATA_URL_LENGTH = 1_000_000;

/**
 * Validasi file gambar berdasarkan tipe MIME dan ukuran input.
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

/** Memuat File menjadi HTMLImageElement. */
function loadImage(file) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Gagal memuat gambar.'));
    };
    img.src = url;
  });
}

/**
 * Mengkonversi File menjadi data URL yang sudah DIKECILKAN lewat canvas.
 * - Thumbnail: maxWidth 800px, screenshot: maxWidth 1280px.
 * - Output JPEG kualitas 0.8 (lebih kecil dari PNG asli).
 * - Melempar error bila hasil masih lebih besar dari ~1 MB.
 *
 * @param {File} file
 * @param {number} maxWidth - lebar maksimum output (default 1280 untuk screenshot)
 * @param {number} quality - kualitas JPEG 0-1 (default 0.8)
 * @returns {Promise<string>} data URL "data:image/jpeg;base64,..."
 */
export async function fileToOptimizedDataUrl(file, maxWidth = 1280, quality = 0.8) {
  const img = await loadImage(file);

  let width = img.naturalWidth || img.width;
  let height = img.naturalHeight || img.height;

  // Kecilkan bila melebihi lebar maksimum (jaga rasio)
  if (width > maxWidth) {
    height = Math.round((height * maxWidth) / width);
    width = maxWidth;
  }

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(img, 0, 0, width, height);

  const dataUrl = canvas.toDataURL('image/jpeg', quality);

  if (dataUrl.length > MAX_DATA_URL_LENGTH) {
    throw new Error('Gambar terlalu besar setelah dikompres (maks ~1 MB). Pilih gambar lebih kecil.');
  }

  return dataUrl;
}
