'use strict';

const requireAuth    = require('../../middlewares/requireAuth');
const requireAdmin   = require('../../middlewares/requireAdmin');
const {
  listReviewsHandler,
  summaryHandler,
  createReviewHandler,
  deleteReviewHandler,
  latestReviewsHandler,
  myReviewsHandler,
  communityReviewsHandler,
} = require('./reviews.controller');
const { createReviewBody } = require('./reviews.schema');

module.exports = async function reviewRoutes(app) {
  // ── Rute statis autentikasi (daftarkan SEBELUM route berparameter) ─────────

  // GET /api/reviews/latest  (publik)
  app.get('/reviews/latest', latestReviewsHandler);

  // GET /api/reviews/mine  (butuh token; admin atau student)
  app.get('/reviews/mine', { preHandler: requireAuth }, myReviewsHandler);

  // GET /api/reviews/community  (butuh token; admin atau student)
  app.get('/reviews/community', { preHandler: requireAuth }, communityReviewsHandler);

  // DELETE /api/reviews/:id  (hanya admin)
  app.delete('/reviews/:id', { preHandler: requireAdmin }, deleteReviewHandler);

  // ── Rute berparameter portofolio (didaftarkan setelahnya) ─────────────────

  // GET /api/portfolios/:id/reviews/summary  (publik)
  app.get('/portfolios/:id/reviews/summary', summaryHandler);

  // GET /api/portfolios/:id/reviews  (publik)
  app.get('/portfolios/:id/reviews', listReviewsHandler);

  // POST /api/portfolios/:id/reviews  (publik, rate limit)
  app.post('/portfolios/:id/reviews', {
    schema: { body: createReviewBody },
    config: {
      rateLimit: {
        max: 10,
        timeWindow: '1 minute',
        keyGenerator: (req) => req.ip,
        errorResponseBuilder: (_req, ctx) => ({
          success: false,
          message: `Terlalu banyak ulasan dikirim. Coba lagi dalam ${Math.ceil(ctx.ttl / 1000)} detik.`,
        }),
      },
    },
  }, createReviewHandler);
};
