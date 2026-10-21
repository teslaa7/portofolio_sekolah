'use strict';

/**
 * Mengubah teks menjadi slug URL-friendly.
 * Contoh: "Aplikasi Web React" -> "aplikasi-web-react"
 */
function slugify(text) {
  if (!text) return '';
  return String(text)
    .toLowerCase()
    .trim()
    // Ganti karakter beraksent/unicode umum
    .replace(/[àáâãäå]/g, 'a')
    .replace(/[èéêë]/g, 'e')
    .replace(/[ìíîï]/g, 'i')
    .replace(/[òóôõö]/g, 'o')
    .replace(/[ùúûü]/g, 'u')
    .replace(/[ñ]/g, 'n')
    .replace(/[ç]/g, 'c')
    // Ganti spasi dan underscore dengan tanda hubung
    .replace(/[\s_]+/g, '-')
    // Hapus karakter yang bukan huruf, angka, atau tanda hubung
    .replace(/[^a-z0-9-]/g, '')
    // Hapus tanda hubung berulang
    .replace(/-+/g, '-')
    // Hapus tanda hubung di awal dan akhir
    .replace(/^-+|-+$/g, '');
}

module.exports = { slugify };
