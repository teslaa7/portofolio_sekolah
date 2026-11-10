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

// Google Drive URL validator
const DRIVE_REGEX = /^https:\/\/(drive|docs)\.google\.com\/.+/;

// Data URL base64 untuk gambar
const IMAGE_URL_REGEX = /^((https?:\/\/.+)|(data:image\/(jpeg|png|webp);base64,.+))$/;
const MAX_IMAGE_LENGTH = 1500000;

function validateUrl(value, fieldName) {
  if (!value || value.trim() === '') return null;
  if (!URL_REGEX.test(value.trim())) {
    return { field: fieldName, message: `${fieldName} harus berupa URL http/https yang valid atau dikosongkan.` };
  }
  return null;
}

function validateProcessUrl(value) {
  if (!value || value.trim() === '') return null;
  if (!DRIVE_REGEX.test(value.trim())) {
    return { field: 'process_url', message: 'Link proses pembuatan harus berupa tautan Google Drive (drive.google.com / docs.google.com).' };
  }
  return null;
}

/**
 * Validasi gambar (thumbnail / screenshot): boleh URL http(s) atau data URL base64
 * (jpeg/png/webp). Boleh kosong. Maks ~1.500.000 karakter per gambar.
 */
function validateImage(value, fieldName) {
  if (!value || value.trim() === '') return null;
  const v = value.trim();
  if (v.length > MAX_IMAGE_LENGTH) {
    return { field: fieldName, message: `${fieldName} terlalu besar (maks ${MAX_IMAGE_LENGTH} karakter).` };
  }
  if (!IMAGE_URL_REGEX.test(v)) {
    return { field: fieldName, message: `${fieldName} harus berupa URL http/https atau data URL base64 (jpeg/png/webp).` };
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
async function listPortfolios(db, params, actor = null) {
  const { page, limit, offset } = getPagination(params.page, params.limit);

  const isAdmin = Boolean(actor && actor.role === 'admin');
  // Batas limit
  const maxLimit = isAdmin ? 1000 : 100;
  const safeLimit = Math.min(limit, maxLimit);

  const { rows, total } = await findPortfolios(
    db,
    { ...params, page, limit: safeLimit, offset },
    actor
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
async function getPortfolioBySlug(db, slug, actor = null) {
  const portfolio = await findPortfolioBySlug(db, slug);
  if (!portfolio) return null;
  const isAdmin = Boolean(actor && actor.role === 'admin');
  const isOwner = Boolean(actor && actor.role === 'student' && portfolio.owner_id === actor.id);
  if (!isAdmin && !portfolio.owner_active) return null; // pemilik nonaktif → 404 untuk publik
  if (portfolio.status === 'published' || isAdmin || isOwner) return portfolio;
  return null;
}

/**
 * Mengambil detail portofolio berdasarkan ID (untuk admin edit).
 */
async function getPortfolioById(db, id, actor = null) {
  const portfolio = await findPortfolioById(db, id);
  if (!portfolio) return { data: null, notFound: true, forbidden: false };
  // Admin atau pemilik; selain itu 403
  const isAdmin = Boolean(actor && actor.role === 'admin');
  const isOwner = Boolean(actor && actor.role === 'student' && portfolio.owner_id === actor.id);
  if (isAdmin || isOwner) return { data: portfolio, notFound: false, forbidden: false };
  return { data: null, notFound: false, forbidden: true };
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
async function createPortfolio(db, payload, actor = null) {
  const errors = [];

  // Validasi category_id ada di DB
  const [[catRow]] = await db.query('SELECT id FROM categories WHERE id = ? LIMIT 1', [payload.category_id]);
  if (!catRow) {
    errors.push({ field: 'category_id', message: 'Kategori tidak ditemukan.' });
  }

  // Validasi URL
  const urlError1 = validateUrl(payload.project_url, 'project_url');
  const urlError2 = validateUrl(payload.repo_url, 'repo_url');
  const urlError3 = validateProcessUrl(payload.process_url);
  if (urlError1) errors.push(urlError1);
  if (urlError2) errors.push(urlError2);
  if (urlError3) errors.push(urlError3);

  // Validasi gambar (thumbnail & screenshots) — menerima data URL base64
  if (payload.thumbnail_url && payload.thumbnail_url.trim()) {
    const imgErr = validateImage(payload.thumbnail_url, 'thumbnail_url');
    if (imgErr) errors.push(imgErr);
  }
  if (Array.isArray(payload.screenshots)) {
    if (payload.screenshots.length > 6) {
      errors.push({ field: 'screenshots', message: 'Maksimal 6 screenshot.' });
    }
    payload.screenshots.forEach((s, i) => {
      const imgErr = validateImage(s, `screenshots[${i}]`);
      if (imgErr) errors.push(imgErr);
    });
  }

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

  const cleanScreenshots = Array.isArray(payload.screenshots)
    ? payload.screenshots
        .map((s) => (typeof s === 'string' ? s.trim() : s))
        .filter((s) => s && String(s).length > 0)
    : [];
  const screenshots =
    cleanScreenshots.length > 0
      ? cleanScreenshots
      : [`https://picsum.photos/seed/${slug}-1/800/500`];

  // Kepemilikan & default per role
  const isStudent = Boolean(actor && actor.role === 'student');
  const isAdmin = Boolean(actor && actor.role === 'admin');

  let ownerId = null;
  let status = payload.status;
  let isFeatured = payload.is_featured;

  if (isStudent) {
    ownerId = Number(actor.id); // murid: owner_id = id sendiri
    isFeatured = false; // dipaksa false
    if (!status) status = 'published'; // default published
  } else if (isAdmin) {
    // admin: owner_id dari body jika ada (harus id murid valid), selain itu NULL
    if (payload.owner_id !== undefined && payload.owner_id !== null && payload.owner_id !== '') {
      const oid = Number(payload.owner_id);
      const [[uRow]] = await db.query(
        "SELECT id FROM users WHERE id = ? AND role = 'student' LIMIT 1",
        [oid]
      );
      if (!uRow) {
        errors.push({ field: 'owner_id', message: 'owner_id harus id murid yang valid.' });
      } else {
        ownerId = oid;
      }
    }
    if (!status) status = 'draft'; // default draft
  }

  if (errors.length > 0) return { data: null, errors };

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
    process_url: (payload.process_url || '').trim(),
    thumbnail_url,
    screenshots: safeJsonStringify(screenshots),
    year: payload.year ? Number(payload.year) : new Date().getFullYear(),
    status,
    is_featured: Boolean(isFeatured),
    owner_id: ownerId,
  };

  const insertId = await insertPortfolio(db, data);
  const portfolio = await findPortfolioById(db, insertId);
  return { data: portfolio, errors: [] };
}

/**
 * Memperbarui portofolio yang ada (partial update).
 */
async function updatePortfolio(db, id, payload, actor = null) {
  const existing = await findPortfolioById(db, id);
  if (!existing) return { data: null, notFound: true, errors: [], forbidden: false };

  const isStudent = Boolean(actor && actor.role === 'student');
  const isAdmin = Boolean(actor && actor.role === 'admin');

  // Murid hanya boleh mengubah karya miliknya sendiri
  if (isStudent && existing.owner_id !== actor.id) {
    return { data: null, notFound: false, errors: [], forbidden: true };
  }

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
  if (payload.process_url !== undefined) {
    const err = validateProcessUrl(payload.process_url);
    if (err) errors.push(err);
  }

  // Validasi gambar jika dikirim (menerima data URL base64)
  if (payload.thumbnail_url !== undefined) {
    const imgErr = validateImage(payload.thumbnail_url, 'thumbnail_url');
    if (imgErr) errors.push(imgErr);
  }
  if (payload.screenshots !== undefined && Array.isArray(payload.screenshots)) {
    if (payload.screenshots.length > 6) {
      errors.push({ field: 'screenshots', message: 'Maksimal 6 screenshot.' });
    }
    payload.screenshots.forEach((s, i) => {
      const imgErr = validateImage(s, `screenshots[${i}]`);
      if (imgErr) errors.push(imgErr);
    });
  }

  if (errors.length > 0) return { data: null, notFound: false, errors };

  // owner_id hanya bisa diubah admin (murid diabaikan)
  let ownerIdUpdate = undefined;
  if (isAdmin && payload.owner_id !== undefined) {
    if (payload.owner_id === null || payload.owner_id === '') {
      ownerIdUpdate = null;
    } else {
      const oid = Number(payload.owner_id);
      const [[uRow]] = await db.query(
        "SELECT id FROM users WHERE id = ? AND role = 'student' LIMIT 1",
        [oid]
      );
      if (!uRow) {
        errors.push({ field: 'owner_id', message: 'owner_id harus id murid yang valid.' });
      } else {
        ownerIdUpdate = oid;
      }
    }
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
  if (payload.process_url !== undefined) updateData.process_url = payload.process_url.trim();
  if (payload.thumbnail_url !== undefined) updateData.thumbnail_url = payload.thumbnail_url.trim();
  if (payload.screenshots !== undefined) {
    const cleaned = Array.isArray(payload.screenshots)
      ? payload.screenshots
          .map((s) => (typeof s === 'string' ? s.trim() : s))
          .filter((s) => s && String(s).length > 0)
      : [];
    updateData.screenshots = safeJsonStringify(cleaned);
  }
  if (payload.year !== undefined) updateData.year = Number(payload.year);
  if (payload.status !== undefined) updateData.status = payload.status;
  // is_featured hanya bisa diubah admin (murid diabaikan)
  if (isAdmin && payload.is_featured !== undefined) updateData.is_featured = payload.is_featured ? 1 : 0;
  // owner_id: hasil validasi admin di atas
  if (ownerIdUpdate !== undefined) updateData.owner_id = ownerIdUpdate;

  await updatePortfolioById(db, id, updateData);
  const updated = await findPortfolioById(db, id);
  return { data: updated, notFound: false, errors: [], forbidden: false };
}

/**
 * Menghapus portofolio.
 */
async function deletePortfolio(db, id, actor = null) {
  const portfolio = await findPortfolioById(db, id);
  if (!portfolio) return { deleted: null, notFound: true, forbidden: false };
  const isAdmin = Boolean(actor && actor.role === 'admin');
  const isStudent = Boolean(actor && actor.role === 'student');
  // Murid hanya boleh menghapus karya miliknya sendiri
  if (isStudent && portfolio.owner_id !== actor.id) {
    return { deleted: null, notFound: false, forbidden: true };
  }
  await deletePortfolioById(db, id);
  return { deleted: portfolio, notFound: false, forbidden: false };
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
