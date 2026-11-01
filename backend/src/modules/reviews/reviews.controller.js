'use strict';

const {
  listReviews,
  getSummary,
  createOrUpdateReview,
  removeReview,
  getLatestReviews,
} = require('./reviews.service');
const { successResponse, errorResponse } = require('../../utils/response');

// GET /api/portfolios/:id/reviews
async function listReviewsHandler(req, reply) {
  const { page = 1, limit = 10 } = req.query;
  const result = await listReviews(req.server.db, req.params.id, { page, limit });

  if (result.notFound) {
    return errorResponse(reply, { message: 'Portofolio tidak ditemukan.', statusCode: 404 });
  }
  return successResponse(reply, {
    message: 'Ulasan berhasil diambil.',
    data: result.data,
    meta: result.meta,
  });
}

// GET /api/portfolios/:id/reviews/summary
async function summaryHandler(req, reply) {
  const result = await getSummary(req.server.db, req.params.id);

  if (result.notFound) {
    return errorResponse(reply, { message: 'Portofolio tidak ditemukan.', statusCode: 404 });
  }
  return successResponse(reply, {
    message: 'Ringkasan rating berhasil diambil.',
    data: result.data,
  });
}

// POST /api/portfolios/:id/reviews
async function createReviewHandler(req, reply) {
  const result = await createOrUpdateReview(req.server.db, req.params.id, req.body);

  if (result.errors && result.errors.length > 0) {
    return errorResponse(reply, {
      message: 'Data ulasan tidak valid.',
      errors: result.errors,
      statusCode: 400,
    });
  }
  if (result.notFound) {
    return errorResponse(reply, { message: 'Portofolio tidak ditemukan.', statusCode: 404 });
  }
  if (result.updated) {
    return successResponse(reply, {
      message: 'Ulasan Anda berhasil diperbarui.',
      data: result.data,
    });
  }
  return successResponse(reply, {
    message: 'Ulasan berhasil ditambahkan. Terima kasih!',
    data: result.data,
    statusCode: 201,
  });
}

// DELETE /api/reviews/:id
async function deleteReviewHandler(req, reply) {
  const { deleted } = await removeReview(req.server.db, req.params.id);
  if (!deleted) {
    return errorResponse(reply, { message: 'Ulasan tidak ditemukan.', statusCode: 404 });
  }
  return successResponse(reply, { message: 'Ulasan berhasil dihapus.', data: null });
}

// GET /api/reviews/latest
async function latestReviewsHandler(req, reply) {
  const { limit = 4 } = req.query;
  const data = await getLatestReviews(req.server.db, limit);
  return successResponse(reply, { message: 'Ulasan terbaru berhasil diambil.', data });
}

module.exports = {
  listReviewsHandler,
  summaryHandler,
  createReviewHandler,
  deleteReviewHandler,
  latestReviewsHandler,
};
