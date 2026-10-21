'use strict';

const fp = require('fastify-plugin');
const fastifyJwt = require('@fastify/jwt');
const env = require('../config/env');

module.exports = fp(async function (app) {
  await app.register(fastifyJwt, {
    secret: env.JWT_SECRET,
    sign: {
      expiresIn: env.JWT_EXPIRES_IN,
    },
  });

  /**
   * Decorator untuk memverifikasi JWT.
   * Dipakai di route yang butuh autentikasi.
   * Jika token valid, menyimpan payload ke request.user
   */
  app.decorate('authenticate', async function (req, reply) {
    try {
      await req.jwtVerify();
    } catch (err) {
      reply.code(401).send({
        success: false,
        message: 'Token tidak valid atau telah kedaluwarsa. Silakan login kembali.',
      });
    }
  });
});
