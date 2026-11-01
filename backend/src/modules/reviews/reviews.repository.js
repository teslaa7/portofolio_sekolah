'use strict';

/**
 * Mengkonversi row review dari DB menjadi objek response.
 * @param {object} row
 * @returns {object}
 */
function mapReview(row) {
  return {
    id: Number(row.id),
    portfolio_id: Number(row.portfolio_id),
    name: row.name,
    rating: Number(row.rating),
    comment: row.comment,
    created_at: row.created_at instanceof Date ? row.created_at.toISOString() : row.created_at,
    updated_at: row.updated_at instanceof Date ? row.updated_at.toISOString() : row.updated_at,
  };
}

/**
 * Cek apakah portofolio ada dan berstatus published.
 * @param {import('mysql2/promise').Pool} db
 * @param {number|string} id
 * @returns {Promise<object|null>}
 */
async function findPublishedPortfolioById(db, id) {
  const [rows] = await db.query(
    "SELECT id, title, slug FROM portfolios WHERE id = ? AND status = 'published' LIMIT 1",
    [Number(id)]
  );
  return rows[0] || null;
}

/**
 * Ambil daftar review untuk satu portofolio, urut terbaru.
 * @param {import('mysql2/promise').Pool} db
 * @param {number|string} portfolioId
 * @param {{ limit: number, offset: number }} opts
 */
async function findReviewsByPortfolio(db, portfolioId, { limit, offset }) {
  const [rows] = await db.query(
    `SELECT id, portfolio_id, name, rating, comment, created_at, updated_at
     FROM reviews
     WHERE portfolio_id = ?
     ORDER BY created_at DESC
     LIMIT ? OFFSET ?`,
    [Number(portfolioId), limit, offset]
  );
  return rows.map(mapReview);
}

/**
 * Hitung total review untuk satu portofolio.
 */
async function countReviewsByPortfolio(db, portfolioId) {
  const [rows] = await db.query(
    'SELECT COUNT(*) AS total FROM reviews WHERE portfolio_id = ?',
    [Number(portfolioId)]
  );
  return Number(rows[0].total);
}

/**
 * Ringkasan rating: average (1 desimal), count, dan distribusi 1-5.
 */
async function getReviewSummary(db, portfolioId) {
  const [rows] = await db.query(
    `SELECT
       IFNULL(AVG(rating), 0) AS average,
       COUNT(*) AS count,
       IFNULL(SUM(rating = 1), 0) AS d1,
       IFNULL(SUM(rating = 2), 0) AS d2,
       IFNULL(SUM(rating = 3), 0) AS d3,
       IFNULL(SUM(rating = 4), 0) AS d4,
       IFNULL(SUM(rating = 5), 0) AS d5
     FROM reviews
     WHERE portfolio_id = ?`,
    [Number(portfolioId)]
  );
  const row = rows[0];
  return {
    average: Number(Number(row.average).toFixed(1)),
    count: Number(row.count),
    distribution: {
      1: Number(row.d1),
      2: Number(row.d2),
      3: Number(row.d3),
      4: Number(row.d4),
      5: Number(row.d5),
    },
  };
}

/**
 * Cari review berdasarkan portfolio_id + nama (case-insensitive).
 */
async function findReviewByPortfolioAndName(db, portfolioId, name) {
  const [rows] = await db.query(
    `SELECT id, portfolio_id, name, rating, comment, created_at, updated_at
     FROM reviews
     WHERE portfolio_id = ? AND LOWER(name) = LOWER(?)
     LIMIT 1`,
    [Number(portfolioId), name]
  );
  return rows[0] ? mapReview(rows[0]) : null;
}

/**
 * Ambil satu review berdasarkan ID.
 */
async function findReviewById(db, id) {
  const [rows] = await db.query(
    'SELECT id, portfolio_id, name, rating, comment, created_at, updated_at FROM reviews WHERE id = ? LIMIT 1',
    [Number(id)]
  );
  return rows[0] ? mapReview(rows[0]) : null;
}

/**
 * Sisipkan review baru.
 */
async function insertReview(db, { portfolio_id, name, rating, comment }) {
  const [result] = await db.query(
    'INSERT INTO reviews (portfolio_id, name, rating, comment) VALUES (?, ?, ?, ?)',
    [Number(portfolio_id), name, Number(rating), comment]
  );
  return result.insertId;
}

/**
 * Perbarui rating & comment review yang sudah ada (berdasarkan portfolio + nama),
 * sekaligus reset created_at = NOW() sesuai aturan upsert.
 */
async function updateReviewByPortfolioAndName(db, portfolioId, name, rating, comment) {
  const [result] = await db.query(
    `UPDATE reviews
     SET rating = ?, comment = ?, created_at = NOW()
     WHERE portfolio_id = ? AND LOWER(name) = LOWER(?)`,
    [Number(rating), comment, Number(portfolioId), name]
  );
  return result.affectedRows;
}

/**
 * Hapus review berdasarkan ID.
 */
async function deleteReviewById(db, id) {
  const [result] = await db.query('DELETE FROM reviews WHERE id = ?', [Number(id)]);
  return result.affectedRows;
}

/**
 * N review terbaru dari portofolio published, sertakan title & slug portofolio.
 */
async function findLatestReviews(db, limit) {
  const safeLimit = Math.min(Math.max(1, parseInt(limit, 10) || 4), 20);
  const [rows] = await db.query(
    `SELECT r.id, r.portfolio_id, r.name, r.rating, r.comment,
            r.created_at, r.updated_at,
            p.title AS portfolio_title, p.slug AS portfolio_slug
     FROM reviews r
     INNER JOIN portfolios p ON r.portfolio_id = p.id
     WHERE p.status = 'published'
     ORDER BY r.created_at DESC
     LIMIT ?`,
    [safeLimit]
  );
  return rows.map((row) => ({
    ...mapReview(row),
    portfolio_title: row.portfolio_title,
    portfolio_slug: row.portfolio_slug,
  }));
}

module.exports = {
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
};
