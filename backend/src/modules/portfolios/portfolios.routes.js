'use strict';

const requireAdmin = require('../../middlewares/requireAdmin');
const {
  listHandler,
  relatedHandler,
  detailBySlugHandler,
  detailByIdHandler,
  createHandler,
  updateHandler,
  deleteHandler,
} = require('./portfolios.controller');
const { createPortfolioBody, updatePortfolioBody } = require('./portfolios.schema');

module.exports = async function portfolioRoutes(app) {
  // ── Publik ──────────────────────────────────────────────────────────────
  // Daftarkan /related SEBELUM /:slug agar tidak bentrok
  app.get('/portfolios/related', relatedHandler);

  // List: publik tapi bisa pakai token admin untuk melihat draft
  // Gunakan onRequest hook yang coba verify tapi tidak wajib
  app.get('/portfolios', {
    preHandler: async (req, _reply) => {
      try {
        await req.jwtVerify();
      } catch {
        // Token tidak ada atau invalid: lanjut sebagai publik
      }
    },
  }, listHandler);

  // Detail by slug: sama, coba verify tapi tidak wajib
  app.get('/portfolios/:slug', {
    preHandler: async (req, _reply) => {
      try {
        await req.jwtVerify();
      } catch {
        // lanjut sebagai publik
      }
    },
  }, detailBySlugHandler);

  // ── Admin Only ────────────────────────────────────────────────────────
  app.get('/admin/portfolios/:id', { preHandler: requireAdmin }, detailByIdHandler);

  app.post('/portfolios', {
    preHandler: requireAdmin,
    schema: { body: createPortfolioBody },
  }, createHandler);

  app.put('/portfolios/:id', {
    preHandler: requireAdmin,
    schema: { body: updatePortfolioBody },
  }, updateHandler);

  app.delete('/portfolios/:id', { preHandler: requireAdmin }, deleteHandler);
};
