'use strict';

const loginBody = {
  type: 'object',
  required: ['email', 'password'],
  additionalProperties: false,
  properties: {
    email: { type: 'string', format: 'email', maxLength: 150 },
    password: { type: 'string', minLength: 1, maxLength: 255 },
  },
};

module.exports = { loginBody };
