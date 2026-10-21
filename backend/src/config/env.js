'use strict';

const NODE_ENV = process.env.NODE_ENV || 'development';
const isProd = NODE_ENV === 'production';

// Di production, JWT_SECRET wajib ada
if (isProd && !process.env.JWT_SECRET) {
  console.error('[FATAL] JWT_SECRET wajib diisi di environment production. Server tidak dapat dijalankan.');
  process.exit(1);
}

module.exports = {
  NODE_ENV,
  isProd,
  PORT: parseInt(process.env.PORT, 10) || 3001,

  // Database
  DB_HOST: process.env.DB_HOST || '127.0.0.1',
  DB_PORT: parseInt(process.env.DB_PORT, 10) || 3306,
  DB_NAME: process.env.DB_NAME || 'portofolio_sekolah',
  DB_USER: process.env.DB_USER || 'root',
  DB_PASSWORD: process.env.DB_PASSWORD || '',

  // JWT
  JWT_SECRET: process.env.JWT_SECRET || 'dev_secret_ganti_di_production',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '8h',

  // CORS
  CORS_ORIGIN: (process.env.CORS_ORIGIN || 'http://localhost:3000,http://localhost:5173')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean),
};
