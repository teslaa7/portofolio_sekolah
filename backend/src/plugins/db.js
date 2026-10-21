'use strict';

const fp = require('fastify-plugin');
const mysql = require('mysql2/promise');
const env = require('../config/env');

module.exports = fp(async function (app) {
  const pool = mysql.createPool({
    host: env.DB_HOST,
    port: env.DB_PORT,
    database: env.DB_NAME,
    user: env.DB_USER,
    password: env.DB_PASSWORD,
    connectionLimit: 10,
    waitForConnections: true,
    queueLimit: 0,
    enableKeepAlive: true,
    keepAliveInitialDelay: 0,
    // Tangani koneksi putus
    enableKeepAlive: true,
  });

  // Verifikasi koneksi saat startup
  try {
    const conn = await pool.getConnection();
    app.log.info('Koneksi database berhasil.');
    conn.release();
  } catch (err) {
    app.log.error({ err }, 'Gagal terhubung ke database!');
    process.exit(1);
  }

  // Dekorasi app dengan pool
  app.decorate('db', pool);

  // Tutup pool saat server dimatikan
  app.addHook('onClose', async () => {
    await pool.end();
    app.log.info('Pool database ditutup.');
  });
});
