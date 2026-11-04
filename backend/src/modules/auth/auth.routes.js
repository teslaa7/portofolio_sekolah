'use strict';

const requireAuth = require('../../middlewares/requireAuth');
const {
  loginHandler,
  getMeHandler,
  logoutHandler,
  registerHandler,
  updateProfileHandler,
  changePasswordHandler,
} = require('./auth.controller');
const { loginBody, registerBody, updateProfileBody, changePasswordBody } = require('./auth.schema');

module.exports = async function authRoutes(app) {
  // POST /api/auth/login
  app.post('/login', {
    schema: { body: loginBody },
    config: {
      rateLimit: {
        max: 10,
        timeWindow: '1 minute',
        keyGenerator: (req) => req.ip,
        errorResponseBuilder: (_req, ctx) => ({
          success: false,
          message: `Terlalu banyak percobaan login. Coba lagi dalam ${Math.ceil(ctx.ttl / 1000)} detik.`,
        }),
      },
    },
  }, loginHandler);

  // POST /api/auth/register  (publik, rate limit ketat)
  app.post('/register', {
    schema: { body: registerBody },
    config: {
      rateLimit: {
        max: 5,
        timeWindow: '10 minutes',
        keyGenerator: (req) => req.ip,
        errorResponseBuilder: (_req, ctx) => ({
          success: false,
          message: `Terlalu banyak percobaan pendaftaran. Coba lagi dalam ${Math.ceil(ctx.ttl / 1000)} detik.`,
        }),
      },
    },
  }, registerHandler);

  // GET /api/auth/me
  app.get('/me', { preHandler: requireAuth }, getMeHandler);

  // POST /api/auth/logout
  app.post('/logout', { preHandler: requireAuth }, logoutHandler);

  // PUT /api/auth/profile  (semua user yang login)
  app.put('/profile', {
    preHandler: requireAuth,
    schema: { body: updateProfileBody },
  }, updateProfileHandler);

  // PUT /api/auth/password  (rate limit 5/menit per IP)
  app.put('/password', {
    preHandler: requireAuth,
    schema: { body: changePasswordBody },
    config: {
      rateLimit: {
        max: 5,
        timeWindow: '1 minute',
        keyGenerator: (req) => req.ip,
        errorResponseBuilder: (_req, ctx) => ({
          success: false,
          message: `Terlalu banyak percobaan. Coba lagi dalam ${Math.ceil(ctx.ttl / 1000)} detik.`,
        }),
      },
    },
  }, changePasswordHandler);
};
