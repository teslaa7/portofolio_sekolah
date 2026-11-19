'use strict';

const fp = require('fastify-plugin');
const fastifyHelmet = require('@fastify/helmet');

module.exports = fp(async function (app) {
  await app.register(fastifyHelmet, {
    contentSecurityPolicy: false,
    // Izinkan gambar dari domain yang berbeda (mis. frontend di port 3000 memuat avatar dari port 3001)
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  });
});
