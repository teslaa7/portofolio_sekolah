'use strict';

const requireAdmin = require('../../middlewares/requireAdmin');
const { listHandler, detailHandler, createHandler, updateHandler, deleteHandler } = require('./categories.controller');
const { createCategoryBody, updateCategoryBody } = require('./categories.schema');

module.exports = async function categoryRoutes(app) {
  // Publik
  app.get('/categories', listHandler);
  app.get('/categories/:id', detailHandler);

  // Admin
  app.post('/categories', {
    preHandler: requireAdmin,
    schema: { body: createCategoryBody },
  }, createHandler);

  app.put('/categories/:id', {
    preHandler: requireAdmin,
    schema: { body: updateCategoryBody },
  }, updateHandler);

  app.delete('/categories/:id', { preHandler: requireAdmin }, deleteHandler);
};
