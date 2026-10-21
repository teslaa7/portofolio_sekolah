'use strict';

const fp = require('fastify-plugin');
const fastifyHelmet = require('@fastify/helmet');

module.exports = fp(async function (app) {
  await app.register(fastifyHelmet, {
    contentSecurityPolicy: false, // Dihandle di level frontend/CDN
  });
});
