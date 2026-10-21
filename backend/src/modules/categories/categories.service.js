'use strict';

const { slugify } = require('../../utils/slugify');
const {
  findAllCategories,
  findCategoryById,
  isDuplicateCategory,
  insertCategory,
  updateCategoryById,
  deleteCategoryById,
  countPortfoliosByCategory,
} = require('./categories.repository');

async function listCategories(db) {
  const categories = await findAllCategories(db);
  return { data: categories, meta: { total: categories.length } };
}

async function getCategoryById(db, id) {
  return findCategoryById(db, id);
}

async function createCategory(db, payload) {
  const name = payload.name.trim();
  const slug = payload.slug ? slugify(payload.slug.trim()) : slugify(name);

  const duplicate = await isDuplicateCategory(db, name, slug);
  if (duplicate) {
    return { data: null, conflict: true, message: 'Kategori dengan nama atau slug ini sudah terdaftar.' };
  }

  const insertId = await insertCategory(db, { name, slug });
  const category = await findCategoryById(db, insertId);
  return { data: category, conflict: false };
}

async function updateCategory(db, id, payload) {
  const existing = await findCategoryById(db, id);
  if (!existing) return { data: null, notFound: true, conflict: false };

  const name = payload.name ? payload.name.trim() : existing.name;
  const slug = payload.slug ? slugify(payload.slug.trim()) : slugify(name);

  const duplicate = await isDuplicateCategory(db, name, slug, Number(id));
  if (duplicate) {
    return { data: null, notFound: false, conflict: true, message: 'Nama atau slug kategori sudah digunakan oleh kategori lain.' };
  }

  await updateCategoryById(db, id, { name, slug });
  const updated = await findCategoryById(db, id);
  return { data: updated, notFound: false, conflict: false };
}

async function deleteCategory(db, id) {
  const existing = await findCategoryById(db, id);
  if (!existing) return { deleted: null, notFound: true, inUse: false };

  const count = await countPortfoliosByCategory(db, id);
  if (count > 0) {
    return { deleted: null, notFound: false, inUse: true, count, name: existing.name };
  }

  await deleteCategoryById(db, id);
  return { deleted: existing, notFound: false, inUse: false };
}

module.exports = { listCategories, getCategoryById, createCategory, updateCategory, deleteCategory };
