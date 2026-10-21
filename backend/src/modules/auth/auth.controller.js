'use strict';

const { verifyLogin, getMe } = require('./auth.service');
const { successResponse, errorResponse } = require('../../utils/response');

async function loginHandler(req, reply) {
  const { email, password } = req.body;

  const { user, error } = await verifyLogin(req.server.db, email, password);
  if (error) {
    return errorResponse(reply, { message: error, statusCode: 401 });
  }

  const token = req.server.jwt.sign({ id: user.id, role: user.role });

  return successResponse(reply, {
    message: 'Login berhasil.',
    data: { user, token },
  });
}

async function getMeHandler(req, reply) {
  const user = await getMe(req.server.db, req.user.id);
  if (!user) {
    return errorResponse(reply, { message: 'User tidak ditemukan.', statusCode: 404 });
  }
  return successResponse(reply, { message: 'Data user berhasil diambil.', data: user });
}

async function logoutHandler(req, reply) {
  // JWT stateless: cukup balas sukses; client harus menghapus token sendiri
  return successResponse(reply, { message: 'Berhasil keluar dari sistem.', data: null });
}

module.exports = { loginHandler, getMeHandler, logoutHandler };
