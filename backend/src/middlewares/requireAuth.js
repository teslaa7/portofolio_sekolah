'use strict';

/**
 * Middleware: pastikan request membawa JWT yang valid.
 * Gunakan sebagai preHandler di route yang butuh login.
 */
async function requireAuth(req, reply) {
  try {
    await req.jwtVerify();
  } catch (err) {
    reply.code(401).send({
      success: false,
      message: 'Akses ditolak. Silakan login terlebih dahulu.',
    });
  }
}

module.exports = requireAuth;
