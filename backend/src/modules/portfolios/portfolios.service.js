'use strict';

const { slugify } = require('../../utils/slugify');
const { safeJsonStringify } = require('../../utils/json');
const { getPagination, getTotalPages } = require('../../utils/pagination');
const {
  findPortfolios,
  findPortfolioBySlug,
  findPortfolioById,
  isSlugTaken,
  insertPortfolio,
  updatePortfolioById,
  deletePortfolioById,
  findRelatedPortfolios,
} = require('./portfolios.repository');

// URL regex sederhana (http/https)
const URL_REGEX = /^https?:\/\/.+/;

/**
 * Validasi URL, kembalikan error jika tidak valid (tapi boleh kosong).
 */
function validateUrl(value, fieldName) {
  if (!value || value.trim() === '') return null;
  if (!URL_REGEX.test(value.trim())) {
    return { field: fieldName, message: `${fieldName} harus berupa URL http/https yang valid atau dikosongkan.` };
  }
  return null;
}

/**
 * Membuat slug unik dari title.
 * @param {import('mysql2/promise').Pool} db
 * @param {string} title
 * @param {number|null} excludeId - ID yang dikecualikan saat cek uniqueness (untuk update)
 */
async function generateUniqueSlug(db, title, excludeId = null) {
  const base = slugify(title);
  let candidate = base;
  let counter = 1;
  while (await isSlugTaken(db, candidate, excludeId)) {
    candidate = `${base}-${counter++}`;
  }
  return candidate;
}

/**
 * Mengambil daftar portofolio.
 */
async function listPortfolios(db, params, isAdmin = false) {
  const { page, limit, offset } = getPagination(params.page, params.limit);

  // Batas limit
  const maxLimit = isAdmin ? 1000 : 100;
  const safeLimit = Math.min(limit, maxLimit);

  const { rows, total } = await findPortfolios(
    db,
    { ...params, page, limit: safeLimit, offset },
    isAdmin
  );

  return {
    data: rows,
    meta: { page, limit: safeLimit, total, totalPages: getTotalPages(total, safeLimit) },
  };
}

/**
 * Mengambil detail portofolio berdasarkan slug.
 * Non-admin hanya bisa melihat published.
 */
async function getPortfolioBySlug(db, slug, isAdmin = false) {
  const portfolio = await findPortfolioBySlug(db, slug);
  if (!portfolio) return null;
  if (!isAdmin && portfolio.status !== 'published') return null;
  return portfolio;
}

/**
 * Mengambil detail portofolio berdasarkan ID (untuk admin edit).
 */
async function getPortfolioById(db, id) {
  return findPortfolioById(db, id);
}

/**
 * Mengambil portofolio terkait.
 */
async function getRelatedPortfolios(db, params) {
  return findRelatedPortfolios(db, params);
}

/**
 * Membuat portofolio baru.
 */
async function createPortfolio(db, payload) {
  const errors = [];

  // Validasi category_id ada di DB
  const [[catRow]] = await db.query('SELECT id FROM categories WHERE id = ? LIMIT 1', [payload.category_id]);
  if (!catRow) {
    errors.push({ field: 'category_id', message: 'Kategori tidak ditemukan.' });
  }

  // Validasi URL
  const urlError1 = validateUrl(payload.project_url, 'project_url');
  const urlError2 = validateUrl(payload.repo_url, 'repo_url');
  if (urlError1) errors.push(urlError1);
  if (urlError2) errors.push(urlError2);

  if (errors.length > 0) return { data: null, errors };

  // Buat slug
  let slug;
  if (payload.slug && payload.slug.trim()) {
    const baseSlug = slugify(payload.slug.trim());
    slug = baseSlug;
    let counter = 1;
    while (await isSlugTaken(db, slug)) {
      slug = `${baseSlug}-${counter++}`;
    }
  } else {
    slug = await generateUniqueSlug(db, payload.title);
  }

  // Default thumbnail & screenshots
  const thumbnail_url =
    payload.thumbnail_url && payload.thumbnail_url.trim()
      ? payload.thumbnail_url.trim()
      : `https://picsum.photos/seed/${slug}/600/400`;

  const screenshots =
    Array.isArray(payload.screenshots) && payload.screenshots.length > 0
      ? payload.screenshots
      : [`https://picsum.photos/seed/${slug}-1/800/500`];

  const data = {
    title: payload.title.trim(),
    slug,
    short_description: (payload.short_description || '').trim(),
    description: (payload.description || '').trim(),
    student_name: payload.student_name.trim(),
    class_name: (payload.class_name || '').trim(),
    major: payload.major.trim(),
    category_id: Number(payload.category_id),
    tech_stack: safeJsonStringify(Array.isArray(payload.tech_stack) ? payload.tech_stack : []),
    project_url: (payload.project_url || '').trim(),
    repo_url: (payload.repo_url || '').trim(),
    thumbnail_url,
    screenshots: safeJsonStringify(screenshots),
    year: payload.year ? Number(payload.year) : new Date().getFullYear(),
    status: payload.status || 'draft',
    is_featured: Boolean(payload.is_featured),
  };

  const insertId = await insertPortfolio(db, data);
  const portfolio = await findPortfolioById(db, insertId);
  return { data: portfolio, errors: [] };
}

/**
 * Memperbarui portofolio yang ada (partial update).
 */
async function updatePortfolio(db, id, payload) {
  const existing = await findPortfolioById(db, id);
  if (!existing) return { data: null, notFound: true, errors: [] };

  const errors = [];

  // Validasi category_id jika dikirim
  if (payload.category_id !== undefined) {
    const [[catRow]] = await db.query('SELECT id FROM categories WHERE id = ? LIMIT 1', [payload.category_id]);
    if (!catRow) errors.push({ field: 'category_id', message: 'Kategori tidak ditemukan.' });
  }

  // Validasi URL jika dikirim
  if (payload.project_url !== undefined) {
    const err = validateUrl(payload.project_url, 'project_url');
    if (err) errors.push(err);
  }
  if (payload.repo_url !== undefined) {
    const err = validateUrl(payload.repo_url, 'repo_url');
    if (err) errors.push(err);
  }

  if (errors.length > 0) return { data: null, notFound: false, errors };

  // Slug: buat baru jika title berubah dan slug tidak dikirim
  let newSlug = undefined;
  if (payload.slug && payload.slug.trim()) {
    const baseSlug = slugify(payload.slug.trim());
    newSlug = baseSlug;
    let counter = 1;
    while (await isSlugTaken(db, newSlug, Number(id))) {
      newSlug = `${baseSlug}-${counter++}`;
    }
  } else if (payload.title && payload.title.trim() !== existing.title) {
    newSlug = await generateUniqueSlug(db, payload.title.trim(), Number(id));
  }

  const updateData = {};

  if (payload.title !== undefined) updateData.title = payload.title.trim();
  if (newSlug) updateData.slug = newSlug;
  if (payload.short_description !== undefined) updateData.short_description = payload.short_description.trim();
  if (payload.description !== undefined) updateData.description = payload.description.trim();
  if (payload.student_name !== undefined) updateData.student_name = payload.student_name.trim();
  if (payload.class_name !== undefined) updateData.class_name = payload.class_name.trim();
  if (payload.major !== undefined) updateData.major = payload.major.trim();
  if (payload.category_id !== undefined) updateData.category_id = Number(payload.category_id);
  if (payload.tech_stack !== undefined) updateData.tech_stack = safeJsonStringify(payload.tech_stack);
  if (payload.project_url !== undefined) updateData.project_url = payload.project_url.trim();
  if (payload.repo_url !== undefined) updateData.repo_url = payload.repo_url.trim();
  if (payload.thumbnail_url !== undefined) updateData.thumbnail_url = payload.thumbnail_url.trim();
  if (payload.screenshots !== undefined) updateData.screenshots = safeJsonStringify(payload.screenshots);
  if (payload.year !== undefined) updateData.year = Number(payload.year);
  if (payload.status !== undefined) updateData.status = payload.status;
  if (payload.is_featured !== undefined) updateData.is_featured = payload.is_featured ? 1 : 0;

  await updatePortfolioById(db, id, updateData);
  const updated = await findPortfolioById(db, id);
  return { data: updated, notFound: false, errors: [] };
}

/**
 * Menghapus portofolio.
 */
async function deletePortfolio(db, id) {
  const portfolio = await findPortfolioById(db, id);
  if (!portfolio) return { deleted: null, notFound: true };
  await deletePortfolioById(db, id);
  return { deleted: portfolio, notFound: false };
}

module.exports = {
  listPortfolios,
  getPortfolioBySlug,
  getPortfolioById,
  getRelatedPortfolios,
  createPortfolio,
  updatePortfolio,
  deletePortfolio,
};
