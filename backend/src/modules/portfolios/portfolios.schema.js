'use strict';

const currentYear = new Date().getFullYear();

// Menerima URL http(s) ATAU data URL base64 (jpeg/png/webp), atau string kosong.
// ~1.500.000 karakter cukup untuk gambar base64 hingga sekitar 1 MB.
const IMAGE_URL_PATTERN = '^((https?://.+)|(data:image/(jpeg|png|webp);base64,.+))?$';
const MAX_IMAGE_LENGTH = 1500000;

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
  project_url:  { type: 'string', maxLength: 500 },
  repo_url:     { type: 'string', maxLength: 500 },
  process_url:  { type: 'string', maxLength: 500 },
  thumbnail_url: { type: 'string', maxLength: MAX_IMAGE_LENGTH, pattern: IMAGE_URL_PATTERN },
  screenshots: {
    type: 'array',
    items: { type: 'string', maxLength: MAX_IMAGE_LENGTH, pattern: IMAGE_URL_PATTERN },
    maxItems: 6,
  },
  year: { type: 'integer', minimum: 2000, maximum: currentYear + 1 },
  status: { type: 'string', enum: ['draft', 'published'] },
  is_featured: { type: 'boolean' },
  owner_id: { type: ['integer', 'null'], minimum: 1 },
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
