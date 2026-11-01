'use strict';

const {
  listPortfolios,
  getPortfolioBySlug,
  getPortfolioById,
  getRelatedPortfolios,
  createPortfolio,
  updatePortfolio,
  deletePortfolio,
} = require('./portfolios.service');
const { successResponse, errorResponse } = require('../../utils/response');

/**
 * Ambil aktor dari JWT opsional (token valid). null = tamu.
 * @returns {{ id: number, role: string } | null}
 */
function getActor(req) {
  try {
    if (req.user && req.user.id !== undefined && req.user.role) {
      return { id: Number(req.user.id), role: req.user.role };
    }
  } catch {
    // ignore
  }
  return null;
}

function isAdmin(actor) {
  return Boolean(actor && actor.role === 'admin');
}

// GET /api/portfolios
async function listHandler(req, reply) {
  const actor = getActor(req);
  const {
    page = 1, limit = 9, search = '', major = '', category_id = '',
    year = '', status = '', is_featured = '', sortBy = 'latest',
    mine = '', owner_id = '',
  } = req.query;

  const { data, meta } = await listPortfolios(
    req.server.db,
    { page, limit, search, major, category_id, year, status, is_featured, sortBy, mine, owner_id },
    actor
  );

  return successResponse(reply, { message: 'Data portofolio berhasil diambil.', data, meta });
}

// GET /api/portfolios/related
async function relatedHandler(req, reply) {
  const { exclude_id, category_id, limit = 3 } = req.query;

  if (!exclude_id || !category_id) {
    return errorResponse(reply, {
      message: 'Parameter exclude_id dan category_id wajib diisi.',
      statusCode: 400,
    });
  }

  const data = await getRelatedPortfolios(req.server.db, { exclude_id, category_id, limit });
  return successResponse(reply, {
    message: 'Data portofolio terkait berhasil diambil.',
    data,
    meta: { total: data.length },
  });
}

// GET /api/portfolios/:slug
async function detailBySlugHandler(req, reply) {
  const actor = getActor(req);
  const portfolio = await getPortfolioBySlug(req.server.db, req.params.slug, actor);

  if (!portfolio) {
    return errorResponse(reply, { message: 'Portofolio tidak ditemukan.', statusCode: 404 });
  }
  return successResponse(reply, { message: 'Detail portofolio berhasil diambil.', data: portfolio });
}

// GET /api/admin/portfolios/:id
async function detailByIdHandler(req, reply) {
  const actor = getActor(req);
  const result = await getPortfolioById(req.server.db, req.params.id, actor);

  if (result.notFound) {
    return errorResponse(reply, { message: 'Portofolio tidak ditemukan.', statusCode: 404 });
  }
  if (result.forbidden) {
    return errorResponse(reply, { message: 'Anda hanya dapat mengakses karya milik sendiri.', statusCode: 403 });
  }
  return successResponse(reply, { message: 'Detail portofolio berhasil diambil.', data: result.data });
}

// POST /api/portfolios
async function createHandler(req, reply) {
  const actor = getActor(req);
  const { data, errors } = await createPortfolio(req.server.db, req.body, actor);
  if (errors && errors.length > 0) {
    return errorResponse(reply, { message: 'Data yang dikirim tidak valid.', errors, statusCode: 400 });
  }
  return successResponse(reply, { message: 'Portofolio baru berhasil ditambahkan.', data, statusCode: 201 });
}

// PUT /api/portfolios/:id
async function updateHandler(req, reply) {
  const actor = getActor(req);
  const { data, notFound, forbidden, errors } = await updatePortfolio(req.server.db, req.params.id, req.body, actor);

  if (forbidden) {
    return errorResponse(reply, { message: 'Anda hanya dapat mengubah karya milik sendiri.', statusCode: 403 });
  }
  if (notFound) {
    return errorResponse(reply, { message: 'Portofolio tidak ditemukan.', statusCode: 404 });
  }
  if (errors && errors.length > 0) {
    return errorResponse(reply, { message: 'Data yang dikirim tidak valid.', errors, statusCode: 400 });
  }
  return successResponse(reply, { message: 'Portofolio berhasil diperbarui.', data });
}

// DELETE /api/portfolios/:id
async function deleteHandler(req, reply) {
  const actor = getActor(req);
  const { deleted, notFound, forbidden } = await deletePortfolio(req.server.db, req.params.id, actor);

  if (forbidden) {
    return errorResponse(reply, { message: 'Anda hanya dapat menghapus karya milik sendiri.', statusCode: 403 });
  }
  if (notFound) {
    return errorResponse(reply, { message: 'Portofolio tidak ditemukan.', statusCode: 404 });
  }
  return successResponse(reply, {
    message: `Portofolio "${deleted.title}" berhasil dihapus.`,
    data: null,
  });
}

module.exports = {
  listHandler,
  relatedHandler,
  detailBySlugHandler,
  detailByIdHandler,
  createHandler,
  updateHandler,
  deleteHandler,
};
