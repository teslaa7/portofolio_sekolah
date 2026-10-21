'use strict';

function mapCategory(row) {
  return {
    id: Number(row.id),
    name: row.name,
    slug: row.slug,
  };
}

/**
 * Mengambil semua kategori, urut A-Z.
 */
async function findAllCategories(db) {
  const [rows] = await db.query('SELECT id, name, slug FROM categories ORDER BY name ASC');
  return rows.map(mapCategory);
}

/**
 * Mengambil kategori berdasarkan ID.
 */
async function findCategoryById(db, id) {
  const [rows] = await db.query('SELECT id, name, slug FROM categories WHERE id = ? LIMIT 1', [Number(id)]);
  return rows[0] ? mapCategory(rows[0]) : null;
}

/**
 * Cek duplikasi nama atau slug, opsional kecualikan ID tertentu.
 */
async function isDuplicateCategory(db, name, slug, excludeId = null) {
  if (excludeId) {
    const [rows] = await db.query(
      'SELECT id FROM categories WHERE (LOWER(name) = LOWER(?) OR slug = ?) AND id != ? LIMIT 1',
      [name, slug, excludeId]
    );
    return rows.length > 0;
  }
  const [rows] = await db.query(
    'SELECT id FROM categories WHERE LOWER(name) = LOWER(?) OR slug = ? LIMIT 1',
    [name, slug]
  );
  return rows.length > 0;
}

/**
 * Menyisipkan kategori baru.
 */
async function insertCategory(db, { name, slug }) {
  const [result] = await db.query(
    'INSERT INTO categories (name, slug) VALUES (?, ?)',
    [name, slug]
  );
  return result.insertId;
}

/**
 * Memperbarui kategori.
 */
async function updateCategoryById(db, id, { name, slug }) {
  const [result] = await db.query(
    'UPDATE categories SET name = ?, slug = ?, updated_at = NOW() WHERE id = ?',
    [name, slug, Number(id)]
  );
  return result.affectedRows;
}

/**
 * Menghapus kategori.
 */
async function deleteCategoryById(db, id) {
  const [result] = await db.query('DELETE FROM categories WHERE id = ?', [Number(id)]);
  return result.affectedRows;
}

/**
 * Menghitung berapa portofolio yang memakai kategori ini.
 */
async function countPortfoliosByCategory(db, categoryId) {
  const [rows] = await db.query(
    'SELECT COUNT(*) AS total FROM portfolios WHERE category_id = ?',
    [Number(categoryId)]
  );
  return Number(rows[0].total);
}

module.exports = {
  findAllCategories,
  findCategoryById,
  isDuplicateCategory,
  insertCategory,
  updateCategoryById,
  deleteCategoryById,
  countPortfoliosByCategory,
};
