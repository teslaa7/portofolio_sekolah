'use strict';

// Body untuk POST /api/portfolios/:id/reviews
// additionalProperties true agar field tambahan (mis. user_id dari frontend) tidak ditolak;
// service hanya membaca name, rating, comment.
const createReviewBody = {
  type: 'object',
  required: ['name', 'rating', 'comment'],
  additionalProperties: true,
  properties: {
    name: { type: 'string', minLength: 1, maxLength: 150 },
    rating: { type: 'integer', minimum: 1, maximum: 5 },
    comment: { type: 'string', minLength: 5, maxLength: 500 },
  },
};

module.exports = { createReviewBody };
