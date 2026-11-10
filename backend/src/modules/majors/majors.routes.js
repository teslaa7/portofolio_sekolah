'use strict';

const requireAdmin = require('../../middlewares/requireAdmin');
const { listHandler, detailHandler, createHandler, updateHandler, deleteHandler } = require('./majors.controller');
const { createMajorBody, updateMajorBody } = require('./majors.schema');

module.exports = async function majorRoutes(app) {
  // Publik
  app.get('/majors', listHandler);
  app.get('/majors/:id', detailHandler);

  // Admin
  app.post('/majors', {
    preHandler: requireAdmin,
    schema: { body: createMajorBody },
  }, createHandler);

  app.put('/majors/:id', {
    preHandler: requireAdmin,
    schema: { body: updateMajorBody },
  }, updateHandler);

  app.delete('/majors/:id', { preHandler: requireAdmin }, deleteHandler);
};
