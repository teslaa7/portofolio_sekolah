'use strict';

const bcrypt = require('bcryptjs');
const { findUserByEmail, findUserById } = require('./auth.repository');

// Hash bcrypt valid yang dibuat sekali saat modul dimuat. Dipakai untuk
// compare dummy saat email tidak ditemukan agar waktu respons konsisten
// (mencegah timing attack).
const DUMMY_HASH = bcrypt.hashSync('dummy-password', 10);

/**
 * Membangun objek user aman (tanpa password & is_active) untuk dikembalikan ke client.
 */
function toSafeUser(user) {
  const { password: _pw, is_active: _ia, ...rest } = user;
  return {
    id: Number(rest.id),
    name: rest.name,
    email: rest.email,
    role: rest.role,
    avatar: rest.avatar || null,
    class_name: rest.class_name || '',
    major: rest.major || '',
  };
}

/**
 * Memverifikasi kredensial login.
 * Selalu mengembalikan pesan error yang sama untuk email salah maupun password salah.
 * Cek is_active dilakukan SETELAH password benar agar tidak membocorkan keberadaan akun.
 * @returns {{ user: object|null, error: string|null, statusCode: number }}
 */
async function verifyLogin(db, email, password) {
  const GENERIC_ERROR = 'Email atau password salah. Silakan periksa kembali kredensial Anda.';

  const user = await findUserByEmail(db, email);
  if (!user) {
    // Tetap lakukan bcrypt compare dummy agar waktu respons konsisten
    await bcrypt.compare(password, DUMMY_HASH);
    return { user: null, error: GENERIC_ERROR, statusCode: 401 };
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return { user: null, error: GENERIC_ERROR, statusCode: 401 };
  }

  // Password benar -> baru cek status akun
  if (!user.is_active || Number(user.is_active) === 0) {
    return { user: null, error: 'Akun Anda dinonaktifkan. Hubungi guru/admin.', statusCode: 403 };
  }

  return { user: toSafeUser(user), error: null, statusCode: 200 };
}

/**
 * Mengambil data user yang sedang login berdasarkan ID dari token.
 * Membalas null jika user tidak ada ATAU nonaktif (sehingga /me -> 401).
 * @param {import('mysql2/promise').Pool} db
 * @param {number} id
 */
async function getMe(db, id) {
  const user = await findUserById(db, id);
  if (!user || !user.is_active || Number(user.is_active) === 0) return null;
  return {
    id: Number(user.id),
    name: user.name,
    email: user.email,
    role: user.role,
    avatar: user.avatar || null,
    class_name: user.class_name || '',
    major: user.major || '',
  };
}

module.exports = { verifyLogin, getMe };
