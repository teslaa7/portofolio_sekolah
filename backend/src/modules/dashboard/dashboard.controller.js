'use strict';

const { getDashboardSummary } = require('./dashboard.service');
const { successResponse } = require('../../utils/response');

async function summaryHandler(req, reply) {
  const data = await getDashboardSummary(req.server.db);
  return successResponse(reply, {
    message: 'Statistik dashboard berhasil diambil.',
    data,
  });
}

module.exports = { summaryHandler };
