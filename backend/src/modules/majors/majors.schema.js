'use strict';

const createMajorBody = {
  type: 'object',
  required: ['name'],
  additionalProperties: false,
  properties: {
    name:        { type: 'string', minLength: 2, maxLength: 100 },
    code:        { type: 'string', maxLength: 20 },
    description: { type: 'string', maxLength: 300 },
  },
};

const updateMajorBody = {
  type: 'object',
  additionalProperties: false,
  properties: {
    name:        { type: 'string', minLength: 2, maxLength: 100 },
    code:        { type: 'string', maxLength: 20 },
    description: { type: 'string', maxLength: 300 },
  },
};

module.exports = { createMajorBody, updateMajorBody };
