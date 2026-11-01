'use strict';

/**
 * Middleware factory: pastikan request membawa JWT yang valid DAN
 * req.user.role termasuk salah satu role yang diizinkan.
 *
 * Untuk role 'student', lakukan cek tambahan ke DB: user harus masih ada
 * dan is_active = 1. Jika tidak, balas 401 'Akun tidak aktif atau tidak ditemukan.'
 *
 * @param {...string} roles - daftar role yang diizinkan, mis. requireRole('admin','student')
 * @returns {Function} Fastify preHandler
 */
function requireRole(...roles) {
  const roleSet = new Set(roles);

  return async function roleGuard(req, reply) {
    // 1. Verifikasi JWT
    try {
      await req.jwtVerify();
    } catch {
      return reply.code(401).send({
        success: false,
        message: 'Akses ditolak. Silakan login terlebih dahulu.',
      });
    }

    // 2. Cek role
    if (!req.user || !roleSet.has(req.user.role)) {
      return reply.code(403).send({
        success: false,
        message: 'Akses ditolak. Anda tidak memiliki izin untuk fitur ini.',
      });
    }

    // 3. Untuk student, cek ke DB bahwa user masih ada & aktif
    if (req.user.role === 'student') {
      try {
        const [rows] = await req.server.db.query(
          'SELECT id FROM users WHERE id = ? AND is_active = 1 LIMIT 1',
          [Number(req.user.id)]
        );
        if (!rows[0]) {
          return reply.code(401).send({
            success: false,
            message: 'Akun tidak aktif atau tidak ditemukan.',
          });
        }
      } catch {
        return reply.code(401).send({
          success: false,
          message: 'Akun tidak aktif atau tidak ditemukan.',
        });
      }
    }
  };
}

module.exports = requireRole;
