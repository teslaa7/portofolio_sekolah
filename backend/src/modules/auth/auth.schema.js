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

// Menerima string kosong, URL http(s), atau data URL base64 gambar.
// Sama dengan IMAGE_URL_PATTERN di portfolios.schema.js.
const AVATAR_PATTERN = '^((https?://.+)|(data:image/(jpeg|png|webp);base64,.+))?$';
const AVATAR_MAX_LENGTH = 500000; // ~375 KB dalam base64, cukup untuk avatar 256×256

// email / role / is_active tidak diterima dari client (additionalProperties: false)
const updateProfileBody = {
  type: 'object',
  additionalProperties: false,
  properties: {
    name:       { type: 'string', minLength: 2, maxLength: 150 },
    avatar:     { type: 'string', maxLength: AVATAR_MAX_LENGTH, pattern: AVATAR_PATTERN },
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
