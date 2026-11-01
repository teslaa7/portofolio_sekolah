'use strict';

// 4 jurusan kejuruan, harus persis sama dengan MAJORS di frontend.
const MAJORS = [
  'Rekayasa Perangkat Lunak (RPL)',
  'Teknik Komputer & Jaringan (TKJ)',
  'Desain Komunikasi Visual / Multimedia',
  'Akuntansi & Keuangan Lembaga',
];

// POST /api/students — tambah murid baru
const createStudentBody = {
  type: 'object',
  required: ['name', 'email', 'password', 'class_name', 'major'],
  additionalProperties: true,
  properties: {
    name: { type: 'string', minLength: 2, maxLength: 150 },
    email: { type: 'string', format: 'email', maxLength: 150 },
    password: { type: 'string', minLength: 6, maxLength: 72 },
    class_name: { type: 'string', maxLength: 50 },
    major: { type: 'string', enum: MAJORS },
    avatar: { type: 'string', maxLength: 500 },
  },
};

// PUT /api/students/:id — update parsial. Password boleh kosong (tidak ubah).
const updateStudentBody = {
  type: 'object',
  additionalProperties: true,
  properties: {
    name: { type: 'string', minLength: 2, maxLength: 150 },
    email: { type: 'string', format: 'email', maxLength: 150 },
    class_name: { type: 'string', maxLength: 50 },
    major: { type: 'string', enum: MAJORS },
    avatar: { type: 'string', maxLength: 500 },
    is_active: { type: 'boolean' },
    password: { type: 'string', maxLength: 72 },
  },
};

module.exports = { createStudentBody, updateStudentBody, MAJORS };
