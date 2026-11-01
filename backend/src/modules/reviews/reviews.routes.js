'use strict';

const requireAdmin = require('../../middlewares/requireAdmin');
const {
  listReviewsHandler,
  summaryHandler,
  createReviewHandler,
  deleteReviewHandler,
  latestReviewsHandler,
} = require('./reviews.controller');
const { createReviewBody } = require('./reviews.schema');

module.exports = async function reviewRoutes(app) {
  // ── Publik ────────────────────────────────────────────────────────────────
  // Ringkasan rating didaftarkan sebelum /:id/reviews agar path lebih spesifik
  // tidak tertangkap oleh route param. (Panjang path berbeda, tidak bentrok.)
  app.get('/portfolios/:id/reviews/summary', summaryHandler);

  // Daftar ulasan (paginasi, urut terbaru)
  app.get('/portfolios/:id/reviews', listReviewsHandler);

  // Kirim ulasan (rate limit 10 request/menit per IP)
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

  // Ulasan terbaru (static sebelum /:id agar tidak tertangkap param)
  app.get('/reviews/latest', latestReviewsHandler);

  // ── Admin Only ─────────────────────────────────────────────────────────────
  app.delete('/reviews/:id', { preHandler: requireAdmin }, deleteReviewHandler);
};
