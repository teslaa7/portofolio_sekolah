'use strict';

const requireRole = require('../../middlewares/requireRole');
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

// Verifikasi JWT opsional: token valid -> req.user terisi; invalid/tidak ada -> tamu.
const optionalAuth = async (req, _reply) => {
  try {
    await req.jwtVerify();
  } catch {
    // lanjut sebagai tamu
  }
};

module.exports = async function portfolioRoutes(app) {
  // ── Publik (token opsional) ───────────────────────────────────────────────
  // /related didaftarkan SEBELUM /:slug agar tidak bentrok
  app.get('/portfolios/related', relatedHandler);

  app.get('/portfolios', { preHandler: optionalAuth }, listHandler);
  app.get('/portfolios/:slug', { preHandler: optionalAuth }, detailBySlugHandler);

  // ── Admin atau Pemilik ──────────────────────────────────────────────────
  app.get('/admin/portfolios/:id', { preHandler: requireRole('admin', 'student') }, detailByIdHandler);

  app.post('/portfolios', {
    preHandler: requireRole('admin', 'student'),
    schema: { body: createPortfolioBody },
  }, createHandler);

  app.put('/portfolios/:id', {
    preHandler: requireRole('admin', 'student'),
    schema: { body: updatePortfolioBody },
  }, updateHandler);

  app.delete('/portfolios/:id', { preHandler: requireRole('admin', 'student') }, deleteHandler);
};
