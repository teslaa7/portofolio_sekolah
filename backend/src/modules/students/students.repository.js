'use strict';

/**
 * Mengkonversi row user menjadi objek response (tanpa password).
 * Menyertakan portfolios_count (jumlah karya milik murid) via subquery.
 */
function mapStudent(row) {
  return {
    id: Number(row.id),
    name: row.name,
    email: row.email,
    role: row.role,
    avatar: row.avatar || null,
    class_name: row.class_name || '',
    major: row.major || '',
    is_active: Boolean(row.is_active),
    portfolios_count: Number(row.portfolios_count) || 0,
    created_at: row.created_at instanceof Date ? row.created_at.toISOString() : row.created_at,
    updated_at: row.updated_at instanceof Date ? row.updated_at.toISOString() : row.updated_at,
  };
}

// Base SELECT: hanya user ber-role student, dengan jumlah karya miliknya.
const BASE_SELECT = `
  SELECT u.id, u.name, u.email, u.role, u.avatar, u.class_name, u.major, u.is_active,
         u.created_at, u.updated_at,
         (SELECT COUNT(*) FROM portfolios p WHERE p.owner_id = u.id) AS portfolios_count
  FROM users u
`;

function escapeLike(str) {
  return str.replace(/[%_\\]/g, '\\$&');
}

/**
 * Daftar murid dengan search (name/email), filter is_active, pagination.
 */
async function findStudents(db, params) {
  const { page, limit, offset, search, is_active } = params;

  const conditions = ["u.role = 'student'"];
  const values = [];

  if (search && search.trim()) {
    const q = `%${escapeLike(search.trim())}%`;
    conditions.push('(u.name LIKE ? OR u.email LIKE ?)');
    values.push(q, q);
  }

  if (is_active === 'true' || is_active === true) {
    conditions.push('u.is_active = 1');
  } else if (is_active === 'false' || is_active === false) {
    conditions.push('u.is_active = 0');
  }

  const where = `WHERE ${conditions.join(' AND ')}`;

  const [countRows] = await db.query(`SELECT COUNT(*) AS total FROM users u ${where}`, values);
  const total = Number(countRows[0].total);

  const [rows] = await db.query(
    `${BASE_SELECT} ${where} ORDER BY u.created_at DESC LIMIT ? OFFSET ?`,
    [...values, limit, offset]
  );

  return { rows: rows.map(mapStudent), total };
}

/**
 * Satu murid berdasarkan ID (hanya role student).
 */
async function findStudentById(db, id) {
  const [rows] = await db.query(`${BASE_SELECT} WHERE u.id = ? AND u.role = 'student' LIMIT 1`, [
    Number(id),
  ]);
  return rows[0] ? mapStudent(rows[0]) : null;
}

/**
 * Cek apakah email sudah dipakai (case-insensitive). excludeId untuk update.
 */
async function isEmailTaken(db, email, excludeId = null) {
  const e = email.trim();
  if (excludeId) {
    const [rows] = await db.query(
      'SELECT id FROM users WHERE LOWER(email) = LOWER(?) AND id != ? LIMIT 1',
      [e, Number(excludeId)]
    );
    return rows.length > 0;
  }
  const [rows] = await db.query('SELECT id FROM users WHERE LOWER(email) = LOWER(?) LIMIT 1', [e]);
  return rows.length > 0;
}

/**
 * Sisipkan murid baru. role selalu 'student', is_active default 1.
 */
async function insertStudent(db, data) {
  const [result] = await db.query(
    `INSERT INTO users (name, email, password, role, avatar, class_name, major, is_active)
     VALUES (?, ?, ?, 'student', ?, ?, ?, 1)`,
    [data.name, data.email, data.password, data.avatar || null, data.class_name, data.major]
  );
  return result.insertId;
}

/**
 * Update parsial murid. Hanya field yang ada di data yang ikut diupdate.
 */
async function updateStudentById(db, id, data) {
  const setClauses = [];
  const values = [];
  const fields = ['name', 'email', 'class_name', 'major', 'avatar', 'is_active', 'password'];
  for (const field of fields) {
    if (data[field] !== undefined) {
      setClauses.push(`${field} = ?`);
      values.push(data[field]);
    }
  }
  if (setClauses.length === 0) return 0;

  setClauses.push('updated_at = NOW()');
  values.push(Number(id));

  const [result] = await db.query(
    `UPDATE users SET ${setClauses.join(', ')} WHERE id = ? AND role = 'student'`,
    values
  );
  return result.affectedRows;
}

/**
 * Hitung jumlah karya milik murid (sebelum dihapus -> owner_id akan SET NULL oleh FK).
 */
async function countPortfoliosByOwner(db, ownerId) {
  const [rows] = await db.query('SELECT COUNT(*) AS total FROM portfolios WHERE owner_id = ?', [
    Number(ownerId),
  ]);
  return Number(rows[0].total);
}

/**
 * Hapus murid (hanya role student). Karya miliknya tetap ada, owner_id menjadi NULL.
 */
async function deleteStudentById(db, id) {
  const [result] = await db.query('DELETE FROM users WHERE id = ? AND role = ?', [
    Number(id),
    'student',
  ]);
  return result.affectedRows;
}

module.exports = {
  findStudents,
  findStudentById,
  isEmailTaken,
  insertStudent,
  updateStudentById,
  countPortfoliosByOwner,
  deleteStudentById,
};
