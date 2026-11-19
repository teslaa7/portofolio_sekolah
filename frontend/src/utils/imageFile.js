/**
 * Utilitas untuk validasi dan konversi file gambar dan video.
 * Dipakai di PortfolioForm untuk upload thumbnail & screenshot.
 */

/** Format gambar yang diterima */
export const IMAGE_ACCEPT = 'image/jpeg,image/png,image/webp';

/** Format video yang diterima */
export const VIDEO_ACCEPT = 'video/mp4,video/webm,video/ogg';

/** Semua format media yang diterima (gambar + video) */
export const MEDIA_ACCEPT = `${IMAGE_ACCEPT},${VIDEO_ACCEPT}`;

/** Ukuran file gambar maksimum dalam MB */
export const MAX_FILE_SIZE_MB = 5;

/** Ukuran file video maksimum dalam MB */
export const MAX_VIDEO_SIZE_MB = 50;

/** Panjang data URL maksimum (~1 MB) hasil kompresi gambar */
const MAX_DATA_URL_LENGTH = 1_000_000;

/** Cek apakah sebuah string adalah tipe MIME video. */
export function isVideoType(mimeType) {
  return mimeType?.startsWith('video/') ?? false;
}

/**
 * Cek apakah nilai src (URL atau data URL) adalah video.
 * Mendukung: data URL video, URL dengan ekstensi .mp4/.webm/.ogg,
 * serta string yang diawali "video:" (penanda internal).
 */
export function isVideoSrc(src) {
  if (!src) return false;
  if (src.startsWith('data:video/')) return true;
  if (src.startsWith('video:')) return true;
  const lower = src.toLowerCase().split('?')[0];
  return lower.endsWith('.mp4') || lower.endsWith('.webm') || lower.endsWith('.ogg');
}

/**
 * Validasi file gambar berdasarkan tipe MIME dan ukuran input.
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
 * Validasi file video berdasarkan tipe MIME dan ukuran.
 */
export function validateVideoFile(file) {
  if (!file) return { valid: false, error: 'Tidak ada file dipilih.' };

  // Terima bila MIME kosong tapi ekstensi dikenal (fallback browser)
  const allowedTypes = VIDEO_ACCEPT.split(',');
  const videoExtensions = ['.mp4', '.webm', '.ogg', '.mov', '.avi'];
  const lowerName = file.name?.toLowerCase() ?? '';
  const isKnownExt = videoExtensions.some((ext) => lowerName.endsWith(ext));

  if (file.type && !allowedTypes.includes(file.type) && !isKnownExt) {
    return {
      valid: false,
      error: `Format video tidak didukung. Gunakan MP4, WebM, atau OGG.`,
    };
  }

  const maxBytes = MAX_VIDEO_SIZE_MB * 1024 * 1024;
  if (file.size > maxBytes) {
    return {
      valid: false,
      error: `Ukuran video terlalu besar (maks ${MAX_VIDEO_SIZE_MB} MB). File ini ${(file.size / 1024 / 1024).toFixed(1)} MB.`,
    };
  }

  return { valid: true, error: null };
}

/**
 * Validasi file media — gambar atau video.
 * Mengembalikan { valid, error, isVideo }.
 * Fallback ke ekstensi nama file jika browser tidak melaporkan MIME yang tepat.
 */
export function validateMediaFile(file) {
  if (!file) return { valid: false, error: 'Tidak ada file dipilih.', isVideo: false };

  // Deteksi video berdasarkan MIME atau ekstensi (fallback untuk browser tertentu)
  const videoExtensions = ['.mp4', '.webm', '.ogg', '.mov', '.avi'];
  const lowerName = file.name?.toLowerCase() ?? '';
  const isVidByExt = videoExtensions.some((ext) => lowerName.endsWith(ext));
  const isVid = isVideoType(file.type) || (file.type === '' && isVidByExt);

  if (isVid) {
    const result = validateVideoFile(file);
    return { ...result, isVideo: true };
  }

  // Coba sebagai gambar
  const result = validateImageFile(file);
  return { ...result, isVideo: false };
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
 * Konversi File gambar menjadi data URL yang sudah dikecilkan lewat canvas.
 */
export async function fileToOptimizedDataUrl(file, maxWidth = 1280, quality = 0.8) {
  const img = await loadImage(file);

  let width = img.naturalWidth || img.width;
  let height = img.naturalHeight || img.height;

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

/**
 * Konversi File video menjadi object URL sementara.
 * Video tidak dikompres — dikembalikan sebagai object URL yang valid
 * selama sesi browser berlangsung. Disimpan di formData sebagai
 * "video:<objectURL>" agar bisa dibedakan dari gambar saat render.
 * Saat submit ke backend, perlu dikonversi atau dikirim sebagai File terpisah.
 */
export function fileToVideoObjectUrl(file) {
  const objectUrl = URL.createObjectURL(file);
  return `video:${objectUrl}`;
}

/**
 * Ambil URL aktual dari nilai media (lepas prefix "video:" bila ada).
 */
export function getMediaSrc(value) {
  if (!value) return '';
  if (value.startsWith('video:')) return value.slice(6);
  return value;
}

/**
 * Konversi File foto profil menjadi data URL persegi (center-crop).
 */
export async function fileToAvatarDataUrl(file, size = 256, quality = 0.85) {
  const img = await loadImage(file);
  const srcW = img.naturalWidth || img.width;
  const srcH = img.naturalHeight || img.height;

  const side = Math.min(srcW, srcH);
  const sx = Math.max(0, (srcW - side) / 2);
  const sy = Math.max(0, (srcH - side) / 2);

  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (ctx.imageSmoothingEnabled !== undefined) ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(img, sx, sy, side, side, 0, 0, size, size);

  let dataUrl = canvas.toDataURL('image/jpeg', quality);
  if (dataUrl.length > 70000) {
    dataUrl = canvas.toDataURL('image/jpeg', 0.7);
  }
  return dataUrl;
}
