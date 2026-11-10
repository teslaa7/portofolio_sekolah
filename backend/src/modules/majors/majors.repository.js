'use strict';

function mapMajor(row) {
  return {
    id:          Number(row.id),
    name:        row.name,
    code:        row.code || '',
    description: row.description || '',
    student_count: Number(row.student_count) || 0,
    portfolio_count: Number(row.portfolio_count) || 0,
  };
}

/** Semua jurusan urut A-Z, disertai jumlah murid & karya. */
async function findAllMajors(db) {
  const [rows] = await db.query(`
    SELECT
      m.id, m.name, m.code, m.description,
      (SELECT COUNT(*) FROM users    u WHERE u.major = m.name AND u.role = 'student') AS student_count,
      (SELECT COUNT(*) FROM portfolios p WHERE p.major = m.name) AS portfolio_count
    FROM majors m
    ORDER BY m.name ASC
  `);
  return rows.map(mapMajor);
}

async function findMajorById(db, id) {
  const [rows] = await db.query(
    `SELECT m.id, m.name, m.code, m.description,
       (SELECT COUNT(*) FROM users     u WHERE u.major = m.name AND u.role = 'student') AS student_count,
       (SELECT COUNT(*) FROM portfolios p WHERE p.major = m.name) AS portfolio_count
     FROM majors m WHERE m.id = ? LIMIT 1`,
    [Number(id)]
  );
  return rows[0] ? mapMajor(rows[0]) : null;
}

async function findMajorByName(db, name, excludeId = null) {
  if (excludeId) {
    const [rows] = await db.query(
      'SELECT id FROM majors WHERE LOWER(name) = LOWER(?) AND id != ? LIMIT 1',
      [name, excludeId]
    );
    return rows[0] || null;
  }
  const [rows] = await db.query(
    'SELECT id FROM majors WHERE LOWER(name) = LOWER(?) LIMIT 1',
    [name]
  );
  return rows[0] || null;
}

async function insertMajor(db, { name, code, description }) {
  const [result] = await db.query(
    'INSERT INTO majors (name, code, description) VALUES (?, ?, ?)',
    [name, code, description]
  );
  return result.insertId;
}

/**
 * Update jurusan + sinkronisasi nama di users & portfolios dalam satu transaksi.
 */
async function updateMajorById(db, id, { name, code, description, oldName }) {
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();
    await conn.query(
      'UPDATE majors SET name=?, code=?, description=?, updated_at=NOW() WHERE id=?',
      [name, code, description, Number(id)]
    );
    if (oldName && oldName !== name) {
      await conn.query('UPDATE users SET major=? WHERE major=?', [name, oldName]);
      await conn.query('UPDATE portfolios SET major=? WHERE major=?', [name, oldName]);
    }
    await conn.commit();
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}

async function deleteMajorById(db, id) {
  const [result] = await db.query('DELETE FROM majors WHERE id=?', [Number(id)]);
  return result.affectedRows;
}

/** Hitung berapa murid & karya yang masih memakai jurusan ini. */
async function countUsersOfMajor(db, name) {
  const [rows] = await db.query(
    "SELECT COUNT(*) AS total FROM users WHERE major = ? AND role = 'student'",
    [name]
  );
  return Number(rows[0].total);
}

async function countPortfoliosOfMajor(db, name) {
  const [rows] = await db.query(
    'SELECT COUNT(*) AS total FROM portfolios WHERE major = ?',
    [name]
  );
  return Number(rows[0].total);
}

/** Cek apakah nama jurusan terdaftar di tabel majors. */
async function isMajorNameValid(db, name) {
  const [rows] = await db.query(
    'SELECT id FROM majors WHERE LOWER(name) = LOWER(?) LIMIT 1',
    [name]
  );
  return rows.length > 0;
}

module.exports = {
  findAllMajors,
  findMajorById,
  findMajorByName,
  insertMajor,
  updateMajorById,
  deleteMajorById,
  countUsersOfMajor,
  countPortfoliosOfMajor,
  isMajorNameValid,
};
