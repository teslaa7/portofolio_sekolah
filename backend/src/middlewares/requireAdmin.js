'use strict';

const requireAuth = require('./requireAuth');

/**
 * Middleware: pastikan request dari user yang sudah login DAN memiliki role admin.
 * Gunakan setelah requireAuth atau gabungkan langsung.
 */
async function requireAdmin(req, reply) {
  // Verifikasi token dulu
  await requireAuth(req, reply);

  // Jika reply sudah dikirim (token invalid), hentikan
  if (reply.sent) return;

  if (!req.user || req.user.role !== 'admin') {
    return reply.code(403).send({
      success: false,
      message: 'Akses ditolak. Hanya admin yang dapat mengakses fitur ini.',
    });
  }
}

module.exports = requireAdmin;
