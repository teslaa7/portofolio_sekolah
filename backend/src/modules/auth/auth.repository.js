'use strict';

/**
 * Mengambil user berdasarkan email (case-insensitive), termasuk profil murid.
 * @param {import('mysql2/promise').Pool} db
 * @param {string} email
 */
async function findUserByEmail(db, email) {
  const [rows] = await db.query(
    'SELECT id, name, email, password, role, avatar, class_name, major, is_active FROM users WHERE LOWER(email) = LOWER(?) LIMIT 1',
    [email.trim()]
  );
  return rows[0] || null;
}

/**
 * Mengambil user berdasarkan ID (tanpa password).
 * @param {import('mysql2/promise').Pool} db
 * @param {number} id
 */
async function findUserById(db, id) {
  const [rows] = await db.query(
    'SELECT id, name, email, role, avatar, class_name, major, is_active FROM users WHERE id = ? LIMIT 1',
    [Number(id)]
  );
  return rows[0] || null;
}

module.exports = { findUserByEmail, findUserById };
