'use strict';

const {
  findAllMajors,
  findMajorById,
  findMajorByName,
  insertMajor,
  updateMajorById,
  deleteMajorById,
  countUsersOfMajor,
  countPortfoliosOfMajor,
} = require('./majors.repository');

async function listMajors(db) {
  const majors = await findAllMajors(db);
  return { data: majors, meta: { total: majors.length } };
}

async function getMajorById(db, id) {
  return findMajorById(db, id);
}

async function createMajor(db, payload) {
  const name        = payload.name.trim();
  const code        = (payload.code || '').trim().toUpperCase();
  const description = (payload.description || '').trim();

  const dup = await findMajorByName(db, name);
  if (dup) {
    return { data: null, conflict: true, message: 'Jurusan dengan nama ini sudah terdaftar.' };
  }

  const insertId = await insertMajor(db, { name, code, description });
  const major = await findMajorById(db, insertId);
  return { data: major, conflict: false };
}

async function updateMajor(db, id, payload) {
  const existing = await findMajorById(db, id);
  if (!existing) return { data: null, notFound: true, conflict: false };

  const name        = payload.name ? payload.name.trim() : existing.name;
  const code        = payload.code !== undefined ? payload.code.trim().toUpperCase() : existing.code;
  const description = payload.description !== undefined ? payload.description.trim() : existing.description;

  const dup = await findMajorByName(db, name, Number(id));
  if (dup) {
    return { data: null, notFound: false, conflict: true, message: 'Nama jurusan sudah digunakan oleh jurusan lain.' };
  }

  await updateMajorById(db, id, { name, code, description, oldName: existing.name });
  const updated = await findMajorById(db, id);
  return { data: updated, notFound: false, conflict: false };
}

async function deleteMajor(db, id) {
  const existing = await findMajorById(db, id);
  if (!existing) return { deleted: null, notFound: true, inUse: false };

  const studentCount   = await countUsersOfMajor(db, existing.name);
  const portfolioCount = await countPortfoliosOfMajor(db, existing.name);
  if (studentCount > 0 || portfolioCount > 0) {
    return {
      deleted: null, notFound: false, inUse: true,
      studentCount, portfolioCount, name: existing.name,
    };
  }

  await deleteMajorById(db, id);
  return { deleted: existing, notFound: false, inUse: false };
}

module.exports = { listMajors, getMajorById, createMajor, updateMajor, deleteMajor };
