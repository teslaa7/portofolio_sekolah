'use strict';

const { verifyLogin, getMe, registerStudent, updateProfile, changePassword } = require('./auth.service');
const { successResponse, errorResponse } = require('../../utils/response');

async function loginHandler(req, reply) {
  const { email, password } = req.body;
  const { user, error, statusCode } = await verifyLogin(req.server.db, email, password);
  if (error) return errorResponse(reply, { message: error, statusCode: statusCode || 401 });

  const token = req.server.jwt.sign({ id: user.id, role: user.role });
  return successResponse(reply, { message: 'Login berhasil.', data: { user, token } });
}

async function getMeHandler(req, reply) {
  const user = await getMe(req.server.db, req.user.id);
  if (!user) return errorResponse(reply, { message: 'Akun tidak ditemukan atau nonaktif.', statusCode: 401 });
  return successResponse(reply, { message: 'Data user berhasil diambil.', data: user });
}

async function logoutHandler(req, reply) {
  return successResponse(reply, { message: 'Berhasil keluar dari sistem.', data: null });
}

async function registerHandler(req, reply) {
  const { user, error, statusCode } = await registerStudent(req.server.db, req.body);
  if (error) return errorResponse(reply, { message: error, statusCode });

  const token = req.server.jwt.sign({ id: user.id, role: user.role });
  return successResponse(reply, {
    message: 'Registrasi berhasil. Selamat datang!',
    data: { user, token },
    statusCode: 201,
  });
}

async function updateProfileHandler(req, reply) {
  const { user, error, statusCode } = await updateProfile(
    req.server.db,
    req.user.id,
    req.user.role,
    req.body
  );
  if (error) return errorResponse(reply, { message: error, statusCode });
  return successResponse(reply, { message: 'Profil berhasil diperbarui.', data: user });
}

async function changePasswordHandler(req, reply) {
  const { current_password, new_password } = req.body;
  const { error, statusCode } = await changePassword(
    req.server.db,
    req.user.id,
    current_password,
    new_password
  );
  if (error) return errorResponse(reply, { message: error, statusCode });
  return successResponse(reply, { message: 'Password berhasil diubah.', data: null });
}

module.exports = {
  loginHandler,
  getMeHandler,
  logoutHandler,
  registerHandler,
  updateProfileHandler,
  changePasswordHandler,
};
