'use strict';

/** Mengambil user berdasarkan email (case-insensitive). */
async function findUserByEmail(db, email) {
  const [rows] = await db.query(
    'SELECT id, name, email, password, role, avatar, class_name, major, is_active FROM users WHERE LOWER(email) = LOWER(?) LIMIT 1',
    [email.trim()]
  );
  return rows[0] || null;
}

/** Mengambil user berdasarkan ID (tanpa password). */
async function findUserById(db, id) {
  const [rows] = await db.query(
    'SELECT id, name, email, role, avatar, class_name, major, is_active FROM users WHERE id = ? LIMIT 1',
    [Number(id)]
  );
  return rows[0] || null;
}

/** Ambil password hash user berdasarkan ID (khusus untuk verifikasi ganti password). */
async function findUserPasswordById(db, id) {
  const [rows] = await db.query(
    'SELECT password FROM users WHERE id = ? LIMIT 1',
    [Number(id)]
  );
  return rows[0]?.password || null;
}

/**
 * Menyisipkan user baru dengan role = 'student', is_active = 1.
 * role & is_active di-hardcode; tidak diterima dari input client.
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
    if (err.code === 'ER_DUP_ENTRY') {
      throw Object.assign(new Error('Email sudah terdaftar.'), { isDuplicate: true });
    }
    throw err;
  }
}

/**
 * Update profil user.
 * - Admin: hanya name & avatar.
 * - Student: name, avatar, class_name, major + sinkronisasi portfolios dalam satu transaksi.
 */
async function updateUserProfile(db, id, { name, avatar, class_name, major, role }) {
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    if (role === 'student') {
      await conn.query(
        'UPDATE users SET name=?, avatar=?, class_name=?, major=?, updated_at=NOW() WHERE id=?',
        [name, avatar, class_name, major, Number(id)]
      );
      // Sinkronisasi salinan di tabel portfolios
      await conn.query(
        'UPDATE portfolios SET student_name=?, class_name=?, major=? WHERE owner_id=?',
        [name, class_name, major, Number(id)]
      );
    } else {
      await conn.query(
        'UPDATE users SET name=?, avatar=?, updated_at=NOW() WHERE id=?',
        [name, avatar, Number(id)]
      );
    }

    await conn.commit();
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}

/** Update password hash user. */
async function updateUserPassword(db, id, passwordHash) {
  const [result] = await db.query(
    'UPDATE users SET password=?, updated_at=NOW() WHERE id=?',
    [passwordHash, Number(id)]
  );
  return result.affectedRows;
}

module.exports = {
  findUserByEmail,
  findUserById,
  findUserPasswordById,
  createStudent,
  updateUserProfile,
  updateUserPassword,
};
