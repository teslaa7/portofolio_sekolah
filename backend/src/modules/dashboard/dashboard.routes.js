'use strict';

const requireAdmin = require('../../middlewares/requireAdmin');
const { summaryHandler } = require('./dashboard.controller');

module.exports = async function dashboardRoutes(app) {
  app.get('/dashboard/summary', { preHandler: requireAdmin }, summaryHandler);
};
