'use strict';

const bcrypt = require('bcryptjs');
const {
  findUserByEmail,
  findUserById,
  findUserPasswordById,
  createStudent,
  updateUserProfile,
  updateUserPassword,
} = require('./auth.repository');

const DUMMY_HASH = bcrypt.hashSync('dummy-password', 10);

/** Bangun objek user aman (tanpa password & is_active) untuk dikirim ke client. */
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

async function registerStudent(db, payload) {
  const email      = payload.email.trim().toLowerCase();
  const name       = payload.name.trim();
  const class_name = payload.class_name.trim();
  const major      = payload.major.trim();

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

  const safeUser = { id: Number(insertId), name, email, role: 'student', avatar: null, class_name, major };
  return { user: safeUser, error: null, statusCode: 201 };
}

/**
 * Update profil user yang sedang login.
 * - Trim semua input; avatar kosong disimpan NULL.
 * - Admin: hanya name & avatar (class_name/major diabaikan).
 * - Student: name, avatar, class_name, major (semua wajib dari schema).
 */
async function updateProfile(db, userId, role, payload) {
  const name   = (payload.name || '').trim();
  const avatar = payload.avatar?.trim() || null;

  // Validasi avatar harus http/https jika diisi
  if (avatar && !/^https?:\/\/.+/.test(avatar)) {
    return { user: null, error: 'URL foto profil harus diawali http:// atau https://.', statusCode: 400 };
  }

  let class_name = '';
  let major      = '';

  if (role === 'student') {
    class_name = (payload.class_name || '').trim();
    major      = (payload.major || '').trim();
    if (!class_name) {
      return { user: null, error: 'Kelas wajib diisi untuk akun murid.', statusCode: 400 };
    }
    if (!major) {
      return { user: null, error: 'Jurusan wajib dipilih untuk akun murid.', statusCode: 400 };
    }
  }

  await updateUserProfile(db, userId, { name, avatar, class_name, major, role });

  // Baca ulang dari DB agar response sinkron
  const updated = await findUserById(db, userId);
  return { user: toSafeUser({ ...updated, is_active: 1 }), error: null };
}

/**
 * Ganti password user.
 * - Verifikasi current_password.
 * - Tolak jika new_password sama dengan yang lama.
 */
async function changePassword(db, userId, currentPassword, newPassword) {
  const storedHash = await findUserPasswordById(db, userId);
  if (!storedHash) {
    return { error: 'Akun tidak ditemukan.', statusCode: 404 };
  }

  const isMatch = await bcrypt.compare(currentPassword, storedHash);
  if (!isMatch) {
    return { error: 'Password saat ini salah.', statusCode: 400 };
  }

  const sameAsOld = await bcrypt.compare(newPassword, storedHash);
  if (sameAsOld) {
    return { error: 'Password baru tidak boleh sama dengan password lama.', statusCode: 400 };
  }

  const newHash = await bcrypt.hash(newPassword, 10);
  await updateUserPassword(db, userId, newHash);

  return { error: null };
}

module.exports = { verifyLogin, getMe, registerStudent, updateProfile, changePassword };
