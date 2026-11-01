'use strict';

const requireAdmin = require('../../middlewares/requireAdmin');
const {
  listHandler,
  detailHandler,
  createHandler,
  updateHandler,
  deleteHandler,
} = require('./students.controller');
const { createStudentBody, updateStudentBody } = require('./students.schema');

module.exports = async function studentRoutes(app) {
  // Semua endpoint kelola murid khusus admin
  app.get('/students', { preHandler: requireAdmin }, listHandler);
  app.get('/students/:id', { preHandler: requireAdmin }, detailHandler);
  app.post('/students', { preHandler: requireAdmin, schema: { body: createStudentBody } }, createHandler);
  app.put('/students/:id', { preHandler: requireAdmin, schema: { body: updateStudentBody } }, updateHandler);
  app.delete('/students/:id', { preHandler: requireAdmin }, deleteHandler);
};
