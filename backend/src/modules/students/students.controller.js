'use strict';

const {
  listStudents,
  getStudent,
  createStudent,
  updateStudent,
  deleteStudent,
} = require('./students.service');
const { successResponse, errorResponse } = require('../../utils/response');

// GET /api/students
async function listHandler(req, reply) {
  const { search = '', is_active = '', page = 1, limit = 10 } = req.query;
  const result = await listStudents(req.server.db, { search, is_active, page, limit });
  return successResponse(reply, {
    message: 'Daftar murid berhasil diambil.',
    data: result.data,
    meta: result.meta,
  });
}

// GET /api/students/:id
async function detailHandler(req, reply) {
  const student = await getStudent(req.server.db, req.params.id);
  if (!student) {
    return errorResponse(reply, { message: 'Murid tidak ditemukan.', statusCode: 404 });
  }
  return successResponse(reply, { message: 'Detail murid berhasil diambil.', data: student });
}

// POST /api/students
async function createHandler(req, reply) {
  const result = await createStudent(req.server.db, req.body);
  if (result.errors && result.errors.length > 0) {
    return errorResponse(reply, { message: 'Data yang dikirim tidak valid.', errors: result.errors, statusCode: 400 });
  }
  if (result.conflict) {
    return errorResponse(reply, { message: 'Email sudah digunakan oleh akun lain.', statusCode: 409 });
  }
  return successResponse(reply, { message: 'Murid baru berhasil ditambahkan.', data: result.data, statusCode: 201 });
}

// PUT /api/students/:id
async function updateHandler(req, reply) {
  const result = await updateStudent(req.server.db, req.params.id, req.body);
  if (result.notFound) {
    return errorResponse(reply, { message: 'Murid tidak ditemukan.', statusCode: 404 });
  }
  if (result.errors && result.errors.length > 0) {
    return errorResponse(reply, { message: 'Data yang dikirim tidak valid.', errors: result.errors, statusCode: 400 });
  }
  if (result.conflict) {
    return errorResponse(reply, { message: 'Email sudah digunakan oleh akun lain.', statusCode: 409 });
  }
  return successResponse(reply, { message: 'Data murid berhasil diperbarui.', data: result.data });
}

// DELETE /api/students/:id
async function deleteHandler(req, reply) {
  const result = await deleteStudent(req.server.db, req.params.id);
  if (result.notFound) {
    return errorResponse(reply, { message: 'Murid tidak ditemukan.', statusCode: 404 });
  }
  return successResponse(reply, {
    message: `Akun murid "${result.deleted.name}" dihapus. ${result.orphansCount} karya tetap ditampilkan tanpa pemilik.`,
    data: null,
  });
}

module.exports = { listHandler, detailHandler, createHandler, updateHandler, deleteHandler };
