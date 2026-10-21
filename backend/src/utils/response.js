'use strict';

/**
 * Helper untuk membangun response yang konsisten.
 */

function successResponse(reply, { data = null, message = 'Berhasil', meta = undefined, statusCode = 200 } = {}) {
  const body = { success: true, message };
  if (data !== undefined) body.data = data;
  if (meta !== undefined) body.meta = meta;
  return reply.code(statusCode).send(body);
}

function errorResponse(reply, { message = 'Terjadi kesalahan', errors = undefined, statusCode = 400 } = {}) {
  const body = { success: false, message };
  if (errors !== undefined && errors.length > 0) body.errors = errors;
  return reply.code(statusCode).send(body);
}

module.exports = { successResponse, errorResponse };
