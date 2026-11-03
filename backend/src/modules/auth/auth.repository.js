'use strict';

/**
 * Mengambil user berdasarkan email (case-insensitive), termasuk profil murid.
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
 */
async function findUserById(db, id) {
  const [rows] = await db.query(
    'SELECT id, name, email, role, avatar, class_name, major, is_active FROM users WHERE id = ? LIMIT 1',
    [Number(id)]
  );
  return rows[0] || null;
}

/**
 * Menyisipkan user baru dengan role = 'student' dan is_active = 1.
 * role dan is_active di-hardcode di server; tidak diterima dari input client.
 * @param {import('mysql2/promise').Pool} db
 * @param {{ name: string, email: string, passwordHash: string, class_name: string, major: string }} data
 * @returns {number} insertId
 */
async function createStudent(db, { name, email, passwordHash, class_name, major }) {
  try {
    const [result] = await db.query(
      `INSERT INTO users (name, email, password, role, is_active, class_name, major)
       VALUES (?, ?, ?, 'student', 1, ?, ?)`,
      [name, email, passwordHash, class_name, major]
    );
    return result.insertId;
  } catch (err) {
    // Tangani race condition: email sudah didaftarkan sesaat sebelum INSERT ini
    if (err.code === 'ER_DUP_ENTRY') {
      throw Object.assign(new Error('Email sudah terdaftar.'), { isDuplicate: true });
    }
    throw err;
  }
}

module.exports = { findUserByEmail, findUserById, createStudent };
