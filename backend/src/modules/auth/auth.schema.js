'use strict';

const loginBody = {
  type: 'object',
  required: ['email', 'password'],
  additionalProperties: false,
  properties: {
    email:    { type: 'string', format: 'email', maxLength: 150 },
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
    // enum dihapus — validasi keberadaan jurusan dilakukan di service via tabel majors
    major:      { type: 'string', minLength: 1, maxLength: 100 },
  },
};

// email / role / is_active tidak diterima dari client (additionalProperties: false)
const updateProfileBody = {
  type: 'object',
  additionalProperties: false,
  properties: {
    name:       { type: 'string', minLength: 2, maxLength: 150 },
    avatar:     { type: 'string', maxLength: 500 },
    class_name: { type: 'string', maxLength: 50 },
    major:      { type: 'string', maxLength: 100 },
  },
};

const changePasswordBody = {
  type: 'object',
  required: ['current_password', 'new_password'],
  additionalProperties: false,
  properties: {
    current_password: { type: 'string', minLength: 1, maxLength: 255 },
    new_password:     { type: 'string', minLength: 8, maxLength: 255 },
  },
};

module.exports = { loginBody, registerBody, updateProfileBody, changePasswordBody };
