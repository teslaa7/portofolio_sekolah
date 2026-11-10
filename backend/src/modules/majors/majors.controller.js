'use strict';

const { listMajors, getMajorById, createMajor, updateMajor, deleteMajor } = require('./majors.service');
const { successResponse, errorResponse } = require('../../utils/response');

async function listHandler(req, reply) {
  const { data, meta } = await listMajors(req.server.db);
  return successResponse(reply, { message: 'Data jurusan berhasil diambil.', data, meta });
}

async function detailHandler(req, reply) {
  const major = await getMajorById(req.server.db, req.params.id);
  if (!major) return errorResponse(reply, { message: 'Jurusan tidak ditemukan.', statusCode: 404 });
  return successResponse(reply, { message: 'Detail jurusan berhasil diambil.', data: major });
}

async function createHandler(req, reply) {
  const result = await createMajor(req.server.db, req.body);
  if (result.conflict) return errorResponse(reply, { message: result.message, statusCode: 409 });
  return successResponse(reply, {
    message: `Jurusan "${result.data.name}" berhasil ditambahkan.`,
    data: result.data,
    statusCode: 201,
  });
}

async function updateHandler(req, reply) {
  const result = await updateMajor(req.server.db, req.params.id, req.body);
  if (result.notFound) return errorResponse(reply, { message: 'Jurusan tidak ditemukan.', statusCode: 404 });
  if (result.conflict) return errorResponse(reply, { message: result.message, statusCode: 409 });
  return successResponse(reply, { message: 'Jurusan berhasil diperbarui.', data: result.data });
}

async function deleteHandler(req, reply) {
  const result = await deleteMajor(req.server.db, req.params.id);
  if (result.notFound) return errorResponse(reply, { message: 'Jurusan tidak ditemukan.', statusCode: 404 });
  if (result.inUse) {
    return errorResponse(reply, {
      message: `Jurusan masih dipakai oleh ${result.studentCount} murid dan ${result.portfolioCount} karya. Pindahkan datanya terlebih dahulu.`,
      statusCode: 409,
    });
  }
  return successResponse(reply, {
    message: `Jurusan "${result.deleted.name}" berhasil dihapus.`,
    data: null,
  });
}

module.exports = { listHandler, detailHandler, createHandler, updateHandler, deleteHandler };
