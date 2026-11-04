'use strict';

const { getPagination, getTotalPages } = require('../../utils/pagination');
const {
  findPublishedPortfolioById,
  findReviewsByPortfolio,
  countReviewsByPortfolio,
  getReviewSummary,
  findReviewByPortfolioAndName,
  findReviewById,
  insertReview,
  updateReviewByPortfolioAndName,
  deleteReviewById,
  findLatestReviews,
} = require('./reviews.repository');

/**
 * Ambil daftar review untuk portofolio (hanya yang published).
 * @returns {Promise<{ data, meta } | { notFound: true }>}
 */
async function listReviews(db, portfolioId, params) {
  const portfolio = await findPublishedPortfolioById(db, portfolioId);
  if (!portfolio) return { notFound: true };

  const { page, limit, offset } = getPagination(params.page, params.limit);
  const safeLimit = Math.min(limit, 100);

  const [rows, total] = await Promise.all([
    findReviewsByPortfolio(db, portfolioId, { limit: safeLimit, offset }),
    countReviewsByPortfolio(db, portfolioId),
  ]);

  return {
    data: rows,
    meta: { page, limit: safeLimit, total, totalPages: getTotalPages(total, safeLimit) },
  };
}

/**
 * Ringkasan rating untuk portofolio (hanya yang published).
 * @returns {Promise<{ data } | { notFound: true }>}
 */
async function getSummary(db, portfolioId) {
  const portfolio = await findPublishedPortfolioById(db, portfolioId);
  if (!portfolio) return { notFound: true };
  return { data: await getReviewSummary(db, portfolioId) };
}

/**
 * Tambah atau perbarui review.
 * Aturan upsert: jika (portfolio_id, nama) sudah ada (case-insensitive),
 * perbarui rating & comment (created_at = NOW()); jika belum, sisipkan baru.
 *
 * @returns {Promise<{ created?: boolean, updated?: boolean, data?: object, errors?: array, notFound?: boolean }>}
 */
async function createOrUpdateReview(db, portfolioId, payload) {
  const errors = [];

  const name = (payload.name || '').trim();
  const comment = (payload.comment || '').trim();
  const rating = Number(payload.rating);

  if (!name) {
    errors.push({ field: 'name', message: 'Nama wajib diisi.' });
  } else if (name.length > 150) {
    errors.push({ field: 'name', message: 'Nama maksimal 150 karakter.' });
  }

  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    errors.push({ field: 'rating', message: 'Rating wajib dipilih (1–5 bintang).' });
  }

  if (!comment || comment.length < 5) {
    errors.push({ field: 'comment', message: 'Komentar minimal 5 karakter.' });
  } else if (comment.length > 500) {
    errors.push({ field: 'comment', message: 'Komentar maksimal 500 karakter.' });
  }

  if (errors.length > 0) return { errors };

  // Portofolio harus ada dan published
  const portfolio = await findPublishedPortfolioById(db, portfolioId);
  if (!portfolio) return { notFound: true };

  // Cek review yang sudah ada berdasarkan nama (case-insensitive)
  const existing = await findReviewByPortfolioAndName(db, portfolioId, name);
  if (existing) {
    await updateReviewByPortfolioAndName(db, portfolioId, name, rating, comment);
    const updated = await findReviewById(db, existing.id);
    return { updated: true, data: updated };
  }

  const insertId = await insertReview(db, { portfolio_id: portfolioId, name, rating, comment });
  const created = await findReviewById(db, insertId);
  return { created: true, data: created };
}

/**
 * Hapus review berdasarkan ID.
 * @returns {Promise<{ deleted: boolean }>}
 */
async function removeReview(db, id) {
  const affected = await deleteReviewById(db, id);
  return { deleted: affected > 0 };
}

/**
 * Ambil N review terbaru dari portofolio published.
 */
async function getLatestReviews(db, limit) {
  return findLatestReviews(db, limit);
}

module.exports = {
  listReviews,
  getSummary,
  createOrUpdateReview,
  removeReview,
  getLatestReviews,
};

// ── Tambahan: ulasan milik user & komunitas ──────────────────────────────────
const {
  findReviewsByOwner,
  countReviewsByOwner,
  getOwnerReviewSummary,
  findCommunityReviews,
  countCommunityReviews,
} = require('./reviews.repository');

/**
 * Ulasan pada karya milik user login (untuk tab "Ulasan di Karya Saya").
 */
async function getMyReviews(db, userId, params) {
  const { page, limit, offset } = getPagination(params.page, params.limit);
  const safeLimit = Math.min(limit, 50);

  const [rows, total, ownerSummary] = await Promise.all([
    findReviewsByOwner(db, userId, { limit: safeLimit, offset }),
    countReviewsByOwner(db, userId),
    getOwnerReviewSummary(db, userId),
  ]);

  return {
    data: rows,
    meta: { page, limit: safeLimit, total, totalPages: getTotalPages(total, safeLimit) },
    summary: ownerSummary,
  };
}

/**
 * Ulasan pada karya published milik murid lain (untuk tab "Ulasan Karya Murid Lain").
 */
async function getCommunityReviews(db, userId, params) {
  const { page, limit, offset } = getPagination(params.page, params.limit);
  const safeLimit = Math.min(limit, 50);

  const [rows, total] = await Promise.all([
    findCommunityReviews(db, userId, { limit: safeLimit, offset }),
    countCommunityReviews(db, userId),
  ]);

  return {
    data: rows,
    meta: { page, limit: safeLimit, total, totalPages: getTotalPages(total, safeLimit) },
  };
}

// Tambahkan ke module.exports yang sudah ada
Object.assign(module.exports, { getMyReviews, getCommunityReviews });
