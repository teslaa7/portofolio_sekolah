'use strict';

/**
 * Menghitung nilai LIMIT dan OFFSET untuk query SQL.
 * @param {number|string} page  - Halaman (mulai dari 1)
 * @param {number|string} limit - Jumlah item per halaman
 * @returns {{ page: number, limit: number, offset: number }}
 */
function getPagination(page, limit) {
  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.max(1, parseInt(limit, 10) || 9);
  const offset = (pageNum - 1) * limitNum;
  return { page: pageNum, limit: limitNum, offset };
}

/**
 * Menghitung total halaman.
 * @param {number} total  - Total record
 * @param {number} limit  - Jumlah item per halaman
 * @returns {number}
 */
function getTotalPages(total, limit) {
  if (limit <= 0) return 1;
  return Math.ceil(total / limit) || 1;
}

module.exports = { getPagination, getTotalPages };
