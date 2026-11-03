'use strict';

const VALID_MAJORS = [
  'Rekayasa Perangkat Lunak (RPL)',
  'Teknik Komputer & Jaringan (TKJ)',
  'Desain Komunikasi Visual / Multimedia',
  'Akuntansi & Keuangan Lembaga',
];

const loginBody = {
  type: 'object',
  required: ['email', 'password'],
  additionalProperties: false,
  properties: {
    email: { type: 'string', format: 'email', maxLength: 150 },
    password: { type: 'string', minLength: 1, maxLength: 255 },
  },
};

const registerBody = {
  type: 'object',
  required: ['name', 'email', 'password', 'class_name', 'major'],
  additionalProperties: false,
  properties: {
    name:       { type: 'string', minLength: 2, maxLength: 150 },
    email:      { type: 'string', format: 'email', maxLength: 150 },
    password:   { type: 'string', minLength: 8, maxLength: 255 },
    class_name: { type: 'string', minLength: 1, maxLength: 50 },
    major:      { type: 'string', minLength: 1, maxLength: 100, enum: VALID_MAJORS },
    // role & is_active TIDAK ada di sini — tidak bisa dikirim dari client
  },
};

module.exports = { loginBody, registerBody };
