'use strict';

const bcrypt = require('bcryptjs');
const { getPagination, getTotalPages } = require('../../utils/pagination');
const {
  findStudents,
  findStudentById,
  isEmailTaken,
  insertStudent,
  updateStudentById,
  countPortfoliosByOwner,
  deleteStudentById,
} = require('./students.repository');
const { isMajorNameValid } = require('../majors/majors.repository');

const URL_REGEX = /^https?:\/\/.+$/;

/** Validasi avatar opsional: boleh kosong atau URL http(s). */
function validateAvatar(value) {
  if (!value || value.trim() === '') return null;
  if (!URL_REGEX.test(value.trim())) {
    return { field: 'avatar', message: 'avatar harus berupa URL http/https yang valid atau dikosongkan.' };
  }
  return null;
}

/**
 * Daftar murid dengan pagination.
 */
async function listStudents(db, params) {
  const { page, limit, offset } = getPagination(params.page, params.limit);
  const safeLimit = Math.min(limit, 100);
  const { rows, total } = await findStudents(db, { ...params, page, limit: safeLimit, offset });
  return {
    data: rows,
    meta: { page, limit: safeLimit, total, totalPages: getTotalPages(total, safeLimit) },
  };
}

/**
 * Satu murid by id.
 */
async function getStudent(db, id) {
  return findStudentById(db, id);
}

/**
 * Tambah murid baru. role selalu student. Email duplikat -> conflict.
 */
async function createStudent(db, payload) {
  const errors = [];

  const name = (payload.name || '').trim();
  const email = (payload.email || '').trim().toLowerCase();
  const password = payload.password || '';

  if (!name || name.length < 2 || name.length > 150) {
    errors.push({ field: 'name', message: 'Nama harus 2-150 karakter.' });
  }
  if (!email) {
    errors.push({ field: 'email', message: 'Email wajib diisi.' });
  }
  if (password.length < 6 || password.length > 72) {
    errors.push({ field: 'password', message: 'Password harus 6-72 karakter.' });
  }
  if (!(await isMajorNameValid(db, payload.major))) {
    errors.push({ field: 'major', message: 'Jurusan tidak valid.' });
  }
  const avErr = validateAvatar(payload.avatar);
  if (avErr) errors.push(avErr);

  if (errors.length > 0) return { data: null, errors };

  if (await isEmailTaken(db, email)) {
    return { data: null, errors: [], conflict: true };
  }

  const data = {
    name,
    email,
    password: bcrypt.hashSync(password, 10),
    avatar: (payload.avatar || '').trim() || null,
    class_name: (payload.class_name || '').trim(),
    major: payload.major,
  };
  const id = await insertStudent(db, data);
  const student = await findStudentById(db, id);
  return { data: student, errors: [] };
}

/**
 * Update parsial murid. Password kosong/tidak dikirim = tidak diubah.
 */
async function updateStudent(db, id, payload) {
  const existing = await findStudentById(db, id);
  if (!existing) return { data: null, notFound: true, errors: [] };

  const errors = [];

  if (payload.name !== undefined) {
    const name = (payload.name || '').trim();
    if (name.length < 2 || name.length > 150) {
      errors.push({ field: 'name', message: 'Nama harus 2-150 karakter.' });
    }
  }
  if (payload.email !== undefined) {
    const email = (payload.email || '').trim().toLowerCase();
    if (!email) errors.push({ field: 'email', message: 'Email wajib diisi.' });
  }
  if (payload.major !== undefined && !(await isMajorNameValid(db, payload.major))) {
    errors.push({ field: 'major', message: 'Jurusan tidak valid.' });
  }
  if (payload.avatar !== undefined) {
    const avErr = validateAvatar(payload.avatar);
    if (avErr) errors.push(avErr);
  }
  if (payload.password !== undefined) {
    const pw = payload.password || '';
    if (pw.length > 0 && (pw.length < 6 || pw.length > 72)) {
      errors.push({ field: 'password', message: 'Password harus 6-72 karakter.' });
    }
  }

  if (errors.length > 0) return { data: null, notFound: false, errors };

  // Cek email unik (kecualikan dirinya)
  if (payload.email !== undefined) {
    const email = (payload.email || '').trim().toLowerCase();
    if (await isEmailTaken(db, email, Number(id))) {
      return { data: null, errors: [], notFound: false, conflict: true };
    }
  }

  const updateData = {};
  if (payload.name !== undefined) updateData.name = (payload.name || '').trim();
  if (payload.email !== undefined) updateData.email = (payload.email || '').trim().toLowerCase();
  if (payload.class_name !== undefined) updateData.class_name = (payload.class_name || '').trim();
  if (payload.major !== undefined) updateData.major = payload.major;
  if (payload.avatar !== undefined) updateData.avatar = (payload.avatar || '').trim() || null;
  if (payload.is_active !== undefined) updateData.is_active = payload.is_active ? 1 : 0;
  if (payload.password !== undefined && payload.password && payload.password.trim() !== '') {
    updateData.password = bcrypt.hashSync(payload.password, 10);
  }

  await updateStudentById(db, id, updateData);
  const updated = await findStudentById(db, id);
  return { data: updated, errors: [], notFound: false };
}

/**
 * Hapus murid. Karya miliknya tetap ada (owner_id -> NULL via FK).
 */
async function deleteStudent(db, id) {
  const student = await findStudentById(db, id);
  if (!student) return { deleted: null, notFound: true };
  const orphansCount = await countPortfoliosByOwner(db, id);
  await deleteStudentById(db, id); // FK ON DELETE SET NULL menjaga portfolios tetap ada
  return { deleted: student, orphansCount, notFound: false };
}

module.exports = { listStudents, getStudent, createStudent, updateStudent, deleteStudent };
