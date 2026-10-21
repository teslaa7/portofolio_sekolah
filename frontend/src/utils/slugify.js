/**
 * Mengubah string menjadi slug ramah URL
 * @param {string} text 
 * @returns {string}
 */
export function slugify(text) {
  if (!text) return '';
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-') // Ganti spasi dengan -
    .replace(/[^\w-]+/g, '') // Hapus karakter non-word selain -
    .replace(/--+/g, '-') // Ganti multiple - dengan single -
    .replace(/^-+/, '') // Trim - dari depan
    .replace(/-+$/, ''); // Trim - dari belakang
}
