'use strict';

const createCategoryBody = {
  type: 'object',
  required: ['name'],
  additionalProperties: false,
  properties: {
    name: { type: 'string', minLength: 2, maxLength: 100 },
    slug: { type: 'string', maxLength: 120 },
  },
};

const updateCategoryBody = {
  type: 'object',
  additionalProperties: false,
  properties: {
    name: { type: 'string', minLength: 2, maxLength: 100 },
    slug: { type: 'string', maxLength: 120 },
  },
};

module.exports = { createCategoryBody, updateCategoryBody };
