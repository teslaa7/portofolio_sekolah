'use strict';

const requireAuth = require('../../middlewares/requireAuth');
const { loginHandler, getMeHandler, logoutHandler } = require('./auth.controller');
const { loginBody } = require('./auth.schema');

module.exports = async function authRoutes(app) {
  // POST /api/auth/login — rate limit ketat via config per-route
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

  // GET /api/auth/me  (butuh token)
  app.get('/me', {
    preHandler: requireAuth,
  }, getMeHandler);

  // POST /api/auth/logout  (butuh token)
  app.post('/logout', {
    preHandler: requireAuth,
  }, logoutHandler);
};
