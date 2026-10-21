'use strict';

const Fastify = require('fastify');
const env = require('./config/env');

async function buildApp() {
  const app = Fastify({
    logger: {
      level: env.isProd ? 'warn' : 'info',
      transport: env.isProd
        ? undefined
        : { target: 'pino-pretty', options: { colorize: true, translateTime: 'HH:MM:ss', ignore: 'pid,hostname' } },
    },
  });

  // Simpan referensi untuk graceful shutdown
  global.__fastifyApp = app;

  // ── Plugins ──────────────────────────────────────────────────────────────
  await app.register(require('./plugins/cors'));
  await app.register(require('./plugins/helmet'));
  await app.register(require('./plugins/db'));
  await app.register(require('./plugins/auth'));

  // Rate limit global (200 req/menit per IP)
  await app.register(require('@fastify/rate-limit'), {
    global: true,
    max: 200,
    timeWindow: '1 minute',
    keyGenerator: (req) => req.ip,
    errorResponseBuilder: (_req, ctx) => ({
      success: false,
      message: `Terlalu banyak permintaan. Coba lagi dalam ${Math.ceil(ctx.ttl / 1000)} detik.`,
    }),
  });

  // ── Modules ───────────────────────────────────────────────────────────────
  await app.register(require('./modules/auth/auth.routes'), { prefix: '/api/auth' });
  await app.register(require('./modules/portfolios/portfolios.routes'), { prefix: '/api' });
  await app.register(require('./modules/categories/categories.routes'), { prefix: '/api' });
  await app.register(require('./modules/dashboard/dashboard.routes'), { prefix: '/api' });

  // ── Health Check ──────────────────────────────────────────────────────────
  app.get('/api/health', async (req, reply) => {
    try {
      await app.db.query('SELECT 1');
      return { success: true, message: 'OK', data: { status: 'ok', db: 'up' } };
    } catch (err) {
      app.log.error(err);
      reply.code(500);
      return { success: false, message: 'Database tidak dapat dijangkau', data: { status: 'error', db: 'down' } };
    }
  });

  // ── Not Found Handler ─────────────────────────────────────────────────────
  app.setNotFoundHandler((req, reply) => {
    reply.code(404).send({ success: false, message: `Route ${req.method} ${req.url} tidak ditemukan.` });
  });

  // ── Global Error Handler ──────────────────────────────────────────────────
  app.setErrorHandler((err, req, reply) => {
    // Log lengkap di server
    app.log.error({ err, req: { method: req.method, url: req.url } }, 'Unhandled error');

    // Fastify validation error
    if (err.validation) {
      const errors = err.validation.map((v) => {
        const field = v.instancePath ? v.instancePath.replace(/^\//, '') : (v.params?.missingProperty || 'unknown');
        return { field, message: v.message };
      });
      return reply.code(400).send({ success: false, message: 'Data yang dikirim tidak valid.', errors });
    }

    // JWT errors
    if (err.code === 'FST_JWT_NO_AUTHORIZATION_IN_HEADER' || err.code === 'FST_JWT_AUTHORIZATION_TOKEN_INVALID' || err.code === 'FST_JWT_AUTHORIZATION_TOKEN_EXPIRED') {
      return reply.code(401).send({ success: false, message: 'Token tidak valid atau telah kedaluwarsa. Silakan login kembali.' });
    }

    // Rate limit
    if (err.statusCode === 429) {
      return reply.code(429).send({ success: false, message: err.message });
    }

    // Kirim pesan generik ke client
    const status = err.statusCode || 500;
    if (status < 500) {
      return reply.code(status).send({ success: false, message: err.message });
    }
    return reply.code(500).send({ success: false, message: 'Terjadi kesalahan pada server. Silakan coba lagi nanti.' });
  });

  return app;
}

module.exports = { buildApp };
