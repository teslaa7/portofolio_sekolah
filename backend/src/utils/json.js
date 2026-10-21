'use strict';

/**
 * Safely parse JSON string; kembalikan fallback jika gagal.
 * @param {string|null|undefined} str
 * @param {*} fallback
 */
function safeJsonParse(str, fallback = []) {
  if (str === null || str === undefined || str === '') return fallback;
  try {
    return JSON.parse(str);
  } catch {
    return fallback;
  }
}

/**
 * Stringify value untuk disimpan ke DB.
 * Jika sudah string, parse dulu lalu stringify ulang agar format konsisten.
 * @param {Array|string|null|undefined} value
 * @returns {string}
 */
function safeJsonStringify(value) {
  if (value === null || value === undefined) return JSON.stringify([]);
  if (Array.isArray(value)) return JSON.stringify(value);
  // Jika sudah string JSON, kembalikan apa adanya jika valid
  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value);
      return JSON.stringify(Array.isArray(parsed) ? parsed : []);
    } catch {
      return JSON.stringify([]);
    }
  }
  return JSON.stringify([]);
}

module.exports = { safeJsonParse, safeJsonStringify };
