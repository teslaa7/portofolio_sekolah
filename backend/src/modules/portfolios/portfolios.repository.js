'use strict';

const { safeJsonParse } = require('../../utils/json');

/**
 * Mengkonversi row dari DB menjadi objek portofolio yang siap dikembalikan ke client.
 * @param {object} row
 * @returns {object}
 */
function mapPortfolio(row) {
  return {
    id: Number(row.id),
    title: row.title,
    slug: row.slug,
    short_description: row.short_description || '',
    description: row.description || '',
    student_name: row.student_name,
    class_name: row.class_name || '',
    major: row.major,
    category_id: Number(row.category_id),
    category_name: row.category_name || '',
    tech_stack: safeJsonParse(row.tech_stack, []),
    project_url: row.project_url || '',
    repo_url: row.repo_url || '',
    thumbnail_url: row.thumbnail_url || '',
    screenshots: safeJsonParse(row.screenshots, []),
    year: Number(row.year),
    status: row.status,
    is_featured: Boolean(row.is_featured),
    created_at: row.created_at instanceof Date ? row.created_at.toISOString() : row.created_at,
    updated_at: row.updated_at instanceof Date ? row.updated_at.toISOString() : row.updated_at,
  };
}

// Base SELECT dengan JOIN ke categories
const BASE_SELECT = `
  SELECT
    p.id, p.title, p.slug, p.short_description, p.description,
    p.student_name, p.class_name, p.major, p.category_id,
    c.name AS category_name,
    p.tech_stack, p.project_url, p.repo_url, p.thumbnail_url,
    p.screenshots, p.year, p.status, p.is_featured,
    p.created_at, p.updated_at
  FROM portfolios p
  LEFT JOIN categories c ON p.category_id = c.id
`;

/**
 * Escape karakter khusus LIKE (% dan _) dari input user.
 */
function escapeLike(str) {
  return str.replace(/[%_\\]/g, '\\$&');
}

/**
 * Whitelist urutan sort yang valid.
 */
const SORT_MAP = {
  latest: 'p.created_at DESC',
  oldest: 'p.created_at ASC',
  'a-z': 'p.title ASC',
  'z-a': 'p.title DESC',
};

/**
 * Mengambil daftar portofolio dengan filter, search, sort, dan pagination.
 * @param {import('mysql2/promise').Pool} db
 * @param {object} params
 * @param {boolean} isAdmin - jika false, paksa status='published'
 */
async function findPortfolios(db, params, isAdmin = false) {
  const { page, limit, offset, search, major, category_id, year, status, is_featured, sortBy } = params;

  const conditions = [];
  const values = [];

  // Paksa published untuk non-admin
  if (!isAdmin) {
    conditions.push("p.status = 'published'");
  } else if (status) {
    conditions.push('p.status = ?');
    values.push(status);
  }

  if (search && search.trim()) {
    const q = `%${escapeLike(search.trim())}%`;
    conditions.push(
      '(p.title LIKE ? OR p.description LIKE ? OR p.short_description LIKE ? OR p.student_name LIKE ? OR p.tech_stack LIKE ?)'
    );
    values.push(q, q, q, q, q);
  }

  if (major && major.trim()) {
    conditions.push('p.major LIKE ?');
    values.push(`%${escapeLike(major.trim())}%`);
  }

  if (category_id) {
    conditions.push('p.category_id = ?');
    values.push(Number(category_id));
  }

  if (year) {
    conditions.push('p.year = ?');
    values.push(Number(year));
  }

  if (is_featured !== undefined && is_featured !== null && is_featured !== '') {
    const featuredVal = is_featured === true || is_featured === 'true' ? 1 : 0;
    conditions.push('p.is_featured = ?');
    values.push(featuredVal);
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
  const orderClause = `ORDER BY ${SORT_MAP[sortBy] || SORT_MAP.latest}`;

  // Count total
  const [countRows] = await db.query(
    `SELECT COUNT(*) AS total FROM portfolios p LEFT JOIN categories c ON p.category_id = c.id ${whereClause}`,
    values
  );
  const total = Number(countRows[0].total);

  // Ambil data dengan pagination
  const [rows] = await db.query(
    `${BASE_SELECT} ${whereClause} ${orderClause} LIMIT ? OFFSET ?`,
    [...values, limit, offset]
  );

  return { rows: rows.map(mapPortfolio), total };
}

/**
 * Mengambil satu portofolio berdasarkan slug.
 */
async function findPortfolioBySlug(db, slug) {
  const [rows] = await db.query(`${BASE_SELECT} WHERE p.slug = ? LIMIT 1`, [slug]);
  return rows[0] ? mapPortfolio(rows[0]) : null;
}

/**
 * Mengambil satu portofolio berdasarkan ID.
 */
async function findPortfolioById(db, id) {
  const [rows] = await db.query(`${BASE_SELECT} WHERE p.id = ? LIMIT 1`, [Number(id)]);
  return rows[0] ? mapPortfolio(rows[0]) : null;
}

/**
 * Cek apakah slug sudah dipakai (opsional kecualikan id tertentu).
 */
async function isSlugTaken(db, slug, excludeId = null) {
  if (excludeId) {
    const [rows] = await db.query('SELECT id FROM portfolios WHERE slug = ? AND id != ? LIMIT 1', [slug, excludeId]);
    return rows.length > 0;
  }
  const [rows] = await db.query('SELECT id FROM portfolios WHERE slug = ? LIMIT 1', [slug]);
  return rows.length > 0;
}

/**
 * Menyisipkan portofolio baru.
 */
async function insertPortfolio(db, data) {
  const [result] = await db.query(
    `INSERT INTO portfolios
      (title, slug, short_description, description, student_name, class_name, major,
       category_id, tech_stack, project_url, repo_url, thumbnail_url, screenshots,
       year, status, is_featured)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      data.title, data.slug, data.short_description, data.description,
      data.student_name, data.class_name, data.major,
      data.category_id, data.tech_stack, data.project_url, data.repo_url,
      data.thumbnail_url, data.screenshots, data.year, data.status, data.is_featured ? 1 : 0,
    ]
  );
  return result.insertId;
}

/**
 * Memperbarui portofolio.
 */
async function updatePortfolioById(db, id, data) {
  const setClauses = [];
  const values = [];

  const fields = [
    'title', 'slug', 'short_description', 'description', 'student_name',
    'class_name', 'major', 'category_id', 'tech_stack', 'project_url',
    'repo_url', 'thumbnail_url', 'screenshots', 'year', 'status', 'is_featured',
  ];

  for (const field of fields) {
    if (data[field] !== undefined) {
      setClauses.push(`${field} = ?`);
      values.push(data[field]);
    }
  }

  if (setClauses.length === 0) return 0;

  setClauses.push('updated_at = NOW()');
  values.push(Number(id));

  const [result] = await db.query(
    `UPDATE portfolios SET ${setClauses.join(', ')} WHERE id = ?`,
    values
  );
  return result.affectedRows;
}

/**
 * Menghapus portofolio berdasarkan ID.
 */
async function deletePortfolioById(db, id) {
  const [result] = await db.query('DELETE FROM portfolios WHERE id = ?', [Number(id)]);
  return result.affectedRows;
}

/**
 * Mengambil portofolio terkait berdasarkan kategori, kecuali satu id.
 */
async function findRelatedPortfolios(db, { exclude_id, category_id, limit = 3 }) {
  const safeLimit = Math.min(Math.max(1, parseInt(limit, 10) || 3), 12);

  // Prioritaskan kategori yang sama
  const [sameCat] = await db.query(
    `${BASE_SELECT}
     WHERE p.status = 'published' AND p.id != ? AND p.category_id = ?
     ORDER BY p.created_at DESC
     LIMIT ?`,
    [Number(exclude_id), Number(category_id), safeLimit]
  );

  let result = sameCat.map(mapPortfolio);

  // Tambahkan dari published lain jika kurang
  if (result.length < safeLimit) {
    const remaining = safeLimit - result.length;
    const excludeIds = [Number(exclude_id), ...result.map((r) => r.id)];
    const placeholders = excludeIds.map(() => '?').join(', ');

    const [others] = await db.query(
      `${BASE_SELECT}
       WHERE p.status = 'published' AND p.id NOT IN (${placeholders})
       ORDER BY p.created_at DESC
       LIMIT ?`,
      [...excludeIds, remaining]
    );
    result = [...result, ...others.map(mapPortfolio)];
  }

  return result;
}

module.exports = {
  findPortfolios,
  findPortfolioBySlug,
  findPortfolioById,
  isSlugTaken,
  insertPortfolio,
  updatePortfolioById,
  deletePortfolioById,
  findRelatedPortfolios,
};
