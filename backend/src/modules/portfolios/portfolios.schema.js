'use strict';

const currentYear = new Date().getFullYear();

// Field yang sama dipakai di POST dan PUT (PUT buat semua optional)
const portfolioProperties = {
  title: { type: 'string', minLength: 3, maxLength: 200 },
  slug: { type: 'string', maxLength: 220 },
  short_description: { type: 'string', maxLength: 150 },
  description: { type: 'string', minLength: 1 },
  student_name: { type: 'string', minLength: 1, maxLength: 150 },
  class_name: { type: 'string', maxLength: 50 },
  major: { type: 'string', minLength: 1, maxLength: 100 },
  category_id: { type: 'integer', minimum: 1 },
  tech_stack: {
    type: 'array',
    items: { type: 'string', maxLength: 500 },
    maxItems: 20,
  },
  project_url: { type: 'string', maxLength: 500 },
  repo_url: { type: 'string', maxLength: 500 },
  thumbnail_url: { type: 'string', maxLength: 500 },
  screenshots: {
    type: 'array',
    items: { type: 'string', maxLength: 500 },
    maxItems: 20,
  },
  year: { type: 'integer', minimum: 2000, maximum: currentYear + 1 },
  status: { type: 'string', enum: ['draft', 'published'] },
  is_featured: { type: 'boolean' },
};

const createPortfolioBody = {
  type: 'object',
  required: ['title', 'student_name', 'major', 'category_id', 'description'],
  additionalProperties: true, // trim di service
  properties: portfolioProperties,
};

const updatePortfolioBody = {
  type: 'object',
  additionalProperties: true,
  properties: portfolioProperties,
};

module.exports = { createPortfolioBody, updatePortfolioBody };
