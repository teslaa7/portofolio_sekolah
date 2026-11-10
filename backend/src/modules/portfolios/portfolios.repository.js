'use strict';

const { safeJsonParse } = require('../../utils/json');

/**
 * Kondisi: karya dengan pemilik aktif ATAU tanpa pemilik (karya sekolah).
 * Dipakai di semua query publik/murid agar karya murid nonaktif tersembunyi.
 * Admin TIDAK menggunakan kondisi ini.
 */
const OWNER_VISIBLE = "(p.owner_id IS NULL OR u.is_active = 1)";

function mapPortfolio(row, { includeScreenshots = true } = {}) {
  const ratingAvg = Number(row.rating_avg) || 0;
  const portfolio = {
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
    process_url: row.process_url || '',
    thumbnail_url: row.thumbnail_url || '',
    screenshots: safeJsonParse(row.screenshots, []),
    year: Number(row.year),
    status: row.status,
    is_featured: Boolean(row.is_featured),
    owner_id: row.owner_id === null || row.owner_id === undefined ? null : Number(row.owner_id),
    owner_name: row.owner_name || '',
    // true bila pemilik aktif ATAU tidak ada pemilik (karya sekolah)
    owner_active: row.owner_id === null || row.owner_id === undefined
      ? true
      : Boolean(row.owner_is_active),
    rating_avg: Number(ratingAvg.toFixed(1)),
    rating_count: Number(row.rating_count) || 0,
    created_at: row.created_at instanceof Date ? row.created_at.toISOString() : row.created_at,
    updated_at: row.updated_at instanceof Date ? row.updated_at.toISOString() : row.updated_at,
  };
  if (!includeScreenshots) delete portfolio.screenshots;
  return portfolio;
}

const BASE_SELECT = `
  SELECT
    p.id, p.title, p.slug, p.short_description, p.description,
    p.student_name, p.class_name, p.major, p.category_id,
    c.name AS category_name,
    p.tech_stack, p.project_url, p.repo_url, p.process_url, p.thumbnail_url,
    p.screenshots, p.year, p.status, p.is_featured,
    p.owner_id,
    u.name      AS owner_name,
    u.is_active AS owner_is_active,
    p.created_at, p.updated_at,
    IFNULL(r.rating_avg, 0)   AS rating_avg,
    IFNULL(r.rating_count, 0) AS rating_count
  FROM portfolios p
  LEFT JOIN categories c ON p.category_id = c.id
  LEFT JOIN users u ON p.owner_id = u.id
  LEFT JOIN (
    SELECT portfolio_id, AVG(rating) AS rating_avg, COUNT(*) AS rating_count
    FROM reviews
    GROUP BY portfolio_id
  ) r ON r.portfolio_id = p.id
`;

function escapeLike(str) {
  return str.replace(/[%_\\]/g, '\\$&');
}

const SORT_MAP = {
  latest: 'p.created_at DESC',
  oldest: 'p.created_at ASC',
  'a-z':  'p.title ASC',
  'z-a':  'p.title DESC',
};

async function findPortfolios(db, params, actor = null) {
  const { page, limit, offset, search, major, category_id, year, status, is_featured, sortBy, mine, owner_id } = params;

  const isAdmin = Boolean(actor && actor.role === 'admin');
  const mineRequested = mine === true || mine === 'true';
  const ownerIdParam = owner_id ? Number(owner_id) : null;

  const conditions = [];
  const values = [];

  if (mineRequested && actor) {
    conditions.push('p.owner_id = ?');
    values.push(Number(actor.id));
    // mine=true: semua status milik sendiri, tidak perlu OWNER_VISIBLE (murid login pasti aktif)
  } else if (isAdmin && ownerIdParam) {
    conditions.push('p.owner_id = ?');
    values.push(ownerIdParam);
    if (status) { conditions.push('p.status = ?'); values.push(status); }
  } else if (isAdmin) {
    // admin: semua, tanpa OWNER_VISIBLE
    if (status) { conditions.push('p.status = ?'); values.push(status); }
  } else {
    // publik / murid tanpa mine: hanya published + owner aktif
    conditions.push("p.status = 'published'");
    conditions.push(OWNER_VISIBLE);
  }

  if (search && search.trim()) {
    const q = `%${escapeLike(search.trim())}%`;
    conditions.push('(p.title LIKE ? OR p.description LIKE ? OR p.short_description LIKE ? OR p.student_name LIKE ? OR p.tech_stack LIKE ?)');
    values.push(q, q, q, q, q);
  }
  if (major && major.trim()) { conditions.push('p.major LIKE ?'); values.push(`%${escapeLike(major.trim())}%`); }
  if (category_id) { conditions.push('p.category_id = ?'); values.push(Number(category_id)); }
  if (year) { conditions.push('p.year = ?'); values.push(Number(year)); }
  if (is_featured !== undefined && is_featured !== null && is_featured !== '') {
    conditions.push('p.is_featured = ?');
    values.push(is_featured === true || is_featured === 'true' ? 1 : 0);
  }

  const whereClause  = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
  const orderClause  = `ORDER BY ${SORT_MAP[sortBy] || SORT_MAP.latest}`;

  // COUNT juga ikut JOIN users agar OWNER_VISIBLE bisa dipakai
  const [countRows] = await db.query(
    `SELECT COUNT(*) AS total
     FROM portfolios p
     LEFT JOIN categories c ON p.category_id = c.id
     LEFT JOIN users u ON p.owner_id = u.id
     ${whereClause}`,
    values
  );
  const total = Number(countRows[0].total);

  const [rows] = await db.query(
    `${BASE_SELECT} ${whereClause} ${orderClause} LIMIT ? OFFSET ?`,
    [...values, limit, offset]
  );

  return { rows: rows.map((row) => mapPortfolio(row, { includeScreenshots: false })), total };
}

async function findPortfolioBySlug(db, slug) {
  const [rows] = await db.query(`${BASE_SELECT} WHERE p.slug = ? LIMIT 1`, [slug]);
  return rows[0] ? mapPortfolio(rows[0]) : null;
}

async function findPortfolioById(db, id) {
  const [rows] = await db.query(`${BASE_SELECT} WHERE p.id = ? LIMIT 1`, [Number(id)]);
  return rows[0] ? mapPortfolio(rows[0]) : null;
}

async function isSlugTaken(db, slug, excludeId = null) {
  if (excludeId) {
    const [rows] = await db.query('SELECT id FROM portfolios WHERE slug = ? AND id != ? LIMIT 1', [slug, excludeId]);
    return rows.length > 0;
  }
  const [rows] = await db.query('SELECT id FROM portfolios WHERE slug = ? LIMIT 1', [slug]);
  return rows.length > 0;
}

async function insertPortfolio(db, data) {
  const [result] = await db.query(
    `INSERT INTO portfolios
      (title, slug, short_description, description, student_name, class_name, major,
       category_id, tech_stack, project_url, repo_url, process_url, thumbnail_url, screenshots,
       year, status, is_featured, owner_id)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      data.title, data.slug, data.short_description, data.description,
      data.student_name, data.class_name, data.major,
      data.category_id, data.tech_stack, data.project_url, data.repo_url,
      data.process_url || '',
      data.thumbnail_url, data.screenshots, data.year, data.status, data.is_featured ? 1 : 0,
      data.owner_id === undefined ? null : data.owner_id,
    ]
  );
  return result.insertId;
}

async function updatePortfolioById(db, id, data) {
  const setClauses = [];
  const values = [];

  const fields = [
    'title', 'slug', 'short_description', 'description', 'student_name',
    'class_name', 'major', 'category_id', 'tech_stack', 'project_url',
    'repo_url', 'process_url', 'thumbnail_url', 'screenshots',
    'year', 'status', 'is_featured', 'owner_id',
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

async function deletePortfolioById(db, id) {
  const [result] = await db.query('DELETE FROM portfolios WHERE id = ?', [Number(id)]);
  return result.affectedRows;
}

async function findRelatedPortfolios(db, { exclude_id, category_id, limit = 3 }) {
  const safeLimit = Math.min(Math.max(1, parseInt(limit, 10) || 3), 12);

  // Prioritaskan kategori yang sama + hanya published + owner aktif
  const [sameCat] = await db.query(
    `${BASE_SELECT}
     WHERE p.status = 'published' AND p.id != ? AND p.category_id = ? AND ${OWNER_VISIBLE}
     ORDER BY p.created_at DESC
     LIMIT ?`,
    [Number(exclude_id), Number(category_id), safeLimit]
  );

  let result = sameCat.map(mapPortfolio);

  if (result.length < safeLimit) {
    const remaining = safeLimit - result.length;
    const excludeIds = [Number(exclude_id), ...result.map((r) => r.id)];
    const placeholders = excludeIds.map(() => '?').join(', ');

    const [others] = await db.query(
      `${BASE_SELECT}
       WHERE p.status = 'published' AND p.id NOT IN (${placeholders}) AND ${OWNER_VISIBLE}
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
