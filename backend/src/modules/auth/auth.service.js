'use strict';

const bcrypt = require('bcryptjs');
const { findUserByEmail, findUserById, createStudent } = require('./auth.repository');

const DUMMY_HASH = bcrypt.hashSync('dummy-password', 10);

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

async function verifyLogin(db, email, password) {
  const GENERIC_ERROR = 'Email atau password salah. Silakan periksa kembali kredensial Anda.';

  const user = await findUserByEmail(db, email);
  if (!user) {
    await bcrypt.compare(password, DUMMY_HASH);
    return { user: null, error: GENERIC_ERROR, statusCode: 401 };
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return { user: null, error: GENERIC_ERROR, statusCode: 401 };
  }

  if (!user.is_active || Number(user.is_active) === 0) {
    return { user: null, error: 'Akun Anda dinonaktifkan. Hubungi guru/admin.', statusCode: 403 };
  }

  return { user: toSafeUser(user), error: null, statusCode: 200 };
}

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

/**
 * Mendaftarkan murid baru.
 * - Normalisasi email (trim + lowercase).
 * - Tolak jika email sudah terdaftar (409).
 * - Hash password dengan bcrypt cost 10.
 * - role 'student' dan is_active = 1 di-hardcode di repository; tidak bisa
 *   dimanipulasi lewat payload.
 * @returns {{ user: object|null, error: string|null, statusCode: number }}
 */
async function registerStudent(db, payload) {
  const email = payload.email.trim().toLowerCase();
  const name  = payload.name.trim();
  const class_name = payload.class_name.trim();
  const major  = payload.major.trim();

  // Cek email sudah ada
  const existing = await findUserByEmail(db, email);
  if (existing) {
    return {
      user: null,
      error: 'Email sudah terdaftar. Silakan masuk atau gunakan email lain.',
      statusCode: 409,
    };
  }

  const passwordHash = await bcrypt.hash(payload.password, 10);

  let insertId;
  try {
    insertId = await createStudent(db, { name, email, passwordHash, class_name, major });
  } catch (err) {
    if (err.isDuplicate) {
      return {
        user: null,
        error: 'Email sudah terdaftar. Silakan masuk atau gunakan email lain.',
        statusCode: 409,
      };
    }
    throw err;
  }

  // Bangun safe user tanpa query tambahan (data sudah diketahui)
  const safeUser = {
    id: Number(insertId),
    name,
    email,
    role: 'student',
    avatar: null,
    class_name,
    major,
  };

  return { user: safeUser, error: null, statusCode: 201 };
}

module.exports = { verifyLogin, getMe, registerStudent };
