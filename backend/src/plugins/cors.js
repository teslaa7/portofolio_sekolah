'use strict';

const fp = require('fastify-plugin');
const fastifyCors = require('@fastify/cors');
const env = require('../config/env');

module.exports = fp(async function (app) {
  await app.register(fastifyCors, {
    origin: (origin, cb) => {
      // Izinkan request tanpa origin (curl, Postman, server-to-server)
      if (!origin) return cb(null, true);
      if (env.CORS_ORIGIN.includes(origin)) return cb(null, true);
      cb(new Error(`Origin ${origin} tidak diizinkan oleh CORS`), false);
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  });
});
