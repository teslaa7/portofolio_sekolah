'use strict';

const { safeJsonParse } = require('../../utils/json');

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

/**
 * Mengambil ringkasan statistik portofolio.
 */
async function getPortfolioSummary(db) {
  const [rows] = await db.query(`
    SELECT
      COUNT(*) AS total,
      SUM(status = 'published') AS published,
      SUM(status = 'draft') AS draft,
      SUM(is_featured = 1) AS featured
    FROM portfolios
  `);
  const row = rows[0];
  return {
    total: Number(row.total),
    published: Number(row.published),
    draft: Number(row.draft),
    featured: Number(row.featured),
  };
}

/**
 * Mengambil jumlah kategori.
 */
async function getCategoriesCount(db) {
  const [rows] = await db.query('SELECT COUNT(*) AS total FROM categories');
  return Number(rows[0].total);
}

/**
 * Mengambil data chart jumlah portofolio per jurusan menggunakan SQL.
 * Pengelompokan menggunakan CASE WHEN untuk efisiensi (tidak menarik semua baris).
 */
async function getMajorChartData(db) {
  const [rows] = await db.query(`
    SELECT
      CASE
        WHEN major LIKE '%RPL%' OR major LIKE '%Rekayasa%' THEN 'RPL'
        WHEN major LIKE '%TKJ%' OR major LIKE '%Jaringan%' THEN 'TKJ'
        WHEN major LIKE '%Multimedia%' OR major LIKE '%DKV%' OR major LIKE '%Desain%' THEN 'Multimedia'
        WHEN major LIKE '%Akuntansi%' THEN 'Akuntansi'
        ELSE 'Lainnya'
      END AS major_key,
      COUNT(*) AS total
    FROM portfolios
    GROUP BY major_key
  `);

  const map = { RPL: 0, TKJ: 0, Multimedia: 0, Akuntansi: 0 };
  rows.forEach((r) => {
    if (map[r.major_key] !== undefined) {
      map[r.major_key] = Number(r.total);
    }
  });

  return [
    { name: 'RPL', total: map.RPL, fullName: 'Rekayasa Perangkat Lunak' },
    { name: 'TKJ', total: map.TKJ, fullName: 'Teknik Komputer & Jaringan' },
    { name: 'Multimedia', total: map.Multimedia, fullName: 'Desain Komunikasi Visual' },
    { name: 'Akuntansi', total: map.Akuntansi, fullName: 'Akuntansi Keuangan' },
  ];
}

/**
 * Mengambil 5 portofolio terbaru (semua status).
 */
async function getLatestPortfolios(db) {
  const [rows] = await db.query(`
    SELECT
      p.id, p.title, p.slug, p.short_description, p.description,
      p.student_name, p.class_name, p.major, p.category_id,
      c.name AS category_name,
      p.tech_stack, p.project_url, p.repo_url, p.thumbnail_url,
      p.screenshots, p.year, p.status, p.is_featured,
      p.created_at, p.updated_at
    FROM portfolios p
    LEFT JOIN categories c ON p.category_id = c.id
    ORDER BY p.created_at DESC
    LIMIT 5
  `);
  return rows.map(mapPortfolio);
}

module.exports = { getPortfolioSummary, getCategoriesCount, getMajorChartData, getLatestPortfolios };
