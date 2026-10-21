'use strict';

const bcrypt = require('bcryptjs');
const { findUserByEmail, findUserById } = require('./auth.repository');

/**
 * Memverifikasi kredensial login.
 * Selalu mengembalikan pesan error yang sama untuk email salah maupun password salah.
 * @param {import('mysql2/promise').Pool} db
 * @param {string} email
 * @param {string} password
 * @returns {{ user: object, error: string|null }}
 */
async function verifyLogin(db, email, password) {
  const GENERIC_ERROR = 'Email atau password salah. Silakan periksa kembali kredensial Anda.';

  const user = await findUserByEmail(db, email);
  if (!user) {
    // Tetap lakukan bcrypt compare dummy agar waktu respons konsisten (mencegah timing attack)
    await bcrypt.compare(password, '$2a$10$dummyhashfortimingconsistency000000000000000000000');
    return { user: null, error: GENERIC_ERROR };
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return { user: null, error: GENERIC_ERROR };
  }

  // Jangan kembalikan field password
  const { password: _pw, ...safeUser } = user;
  // Pastikan id dan avatar sebagai tipe yang benar
  safeUser.id = Number(safeUser.id);
  safeUser.avatar = safeUser.avatar || null;

  return { user: safeUser, error: null };
}

/**
 * Mengambil data user yang sedang login berdasarkan ID dari token.
 * @param {import('mysql2/promise').Pool} db
 * @param {number} id
 */
async function getMe(db, id) {
  const user = await findUserById(db, id);
  if (!user) return null;
  return {
    id: Number(user.id),
    name: user.name,
    email: user.email,
    role: user.role,
    avatar: user.avatar || null,
  };
}

module.exports = { verifyLogin, getMe };
