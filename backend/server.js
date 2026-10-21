'use strict';

require('dotenv').config();

const { buildApp } = require('./src/app');
const env = require('./src/config/env');

async function start() {
  const app = await buildApp();

  try {
    await app.listen({ port: env.PORT, host: '0.0.0.0' });
    app.log.info(`Server berjalan di port ${env.PORT}`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM diterima, mematikan server...');
  try {
    const app = global.__fastifyApp;
    if (app) await app.close();
  } catch (e) {
    console.error(e);
  }
  process.exit(0);
});

start();
