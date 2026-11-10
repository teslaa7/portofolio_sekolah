'use strict';

// POST /api/students — tambah murid baru
const createStudentBody = {
  type: 'object',
  required: ['name', 'email', 'password', 'class_name', 'major'],
  additionalProperties: true,
  properties: {
    name:       { type: 'string', minLength: 2, maxLength: 150 },
    email:      { type: 'string', format: 'email', maxLength: 150 },
    password:   { type: 'string', minLength: 6, maxLength: 72 },
    class_name: { type: 'string', maxLength: 50 },
    // enum dihapus — validasi keberadaan jurusan dilakukan di service via tabel majors
    major:      { type: 'string', minLength: 1, maxLength: 100 },
    avatar:     { type: 'string', maxLength: 500 },
  },
};

// PUT /api/students/:id — update parsial. Password boleh kosong (tidak ubah).
const updateStudentBody = {
  type: 'object',
  additionalProperties: true,
  properties: {
    name:       { type: 'string', minLength: 2, maxLength: 150 },
    email:      { type: 'string', format: 'email', maxLength: 150 },
    class_name: { type: 'string', maxLength: 50 },
    major:      { type: 'string', maxLength: 100 },
    avatar:     { type: 'string', maxLength: 500 },
    is_active:  { type: 'boolean' },
    password:   { type: 'string', maxLength: 72 },
  },
};

module.exports = { createStudentBody, updateStudentBody };
