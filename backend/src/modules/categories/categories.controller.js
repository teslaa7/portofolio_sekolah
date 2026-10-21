'use strict';

const {
  listCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
} = require('./categories.service');
const { successResponse, errorResponse } = require('../../utils/response');

async function listHandler(req, reply) {
  const { data, meta } = await listCategories(req.server.db);
  return successResponse(reply, { message: 'Data kategori berhasil diambil.', data, meta });
}

async function detailHandler(req, reply) {
  const category = await getCategoryById(req.server.db, req.params.id);
  if (!category) {
    return errorResponse(reply, { message: 'Kategori tidak ditemukan.', statusCode: 404 });
  }
  return successResponse(reply, { message: 'Detail kategori berhasil diambil.', data: category });
}

async function createHandler(req, reply) {
  const result = await createCategory(req.server.db, req.body);
  if (result.conflict) {
    return errorResponse(reply, { message: result.message, statusCode: 409 });
  }
  return successResponse(reply, {
    message: `Kategori "${result.data.name}" berhasil ditambahkan.`,
    data: result.data,
    statusCode: 201,
  });
}

async function updateHandler(req, reply) {
  const result = await updateCategory(req.server.db, req.params.id, req.body);
  if (result.notFound) {
    return errorResponse(reply, { message: 'Kategori tidak ditemukan.', statusCode: 404 });
  }
  if (result.conflict) {
    return errorResponse(reply, { message: result.message, statusCode: 409 });
  }
  return successResponse(reply, { message: 'Kategori berhasil diperbarui.', data: result.data });
}

async function deleteHandler(req, reply) {
  const result = await deleteCategory(req.server.db, req.params.id);
  if (result.notFound) {
    return errorResponse(reply, { message: 'Kategori tidak ditemukan.', statusCode: 404 });
  }
  if (result.inUse) {
    return errorResponse(reply, {
      message: `Kategori masih dipakai oleh ${result.count} portofolio dan tidak dapat dihapus.`,
      statusCode: 409,
    });
  }
  return successResponse(reply, {
    message: `Kategori "${result.deleted.name}" berhasil dihapus.`,
    data: null,
  });
}

module.exports = { listHandler, detailHandler, createHandler, updateHandler, deleteHandler };
