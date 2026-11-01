import { apiClient } from './apiClient.js';

export const reviewService = {
  /** Daftar ulasan untuk satu portofolio, terbaru dulu. */
  async getReviews(portfolioId, { page = 1, limit = 10 } = {}) {
    return apiClient.get(`/portfolios/${portfolioId}/reviews?page=${page}&limit=${limit}`);
  },

  /** Ringkasan rating: {average, count, distribution}. */
  async getRatingSummary(portfolioId) {
    return apiClient.get(`/portfolios/${portfolioId}/reviews/summary`);
  },

  /** Kirim ulasan (upsert berdasarkan nama). Hanya {name, rating, comment}. */
  async addReview(portfolioId, { name, rating, comment }) {
    return apiClient.post(`/portfolios/${portfolioId}/reviews`, { name, rating, comment });
  },

  /** Hapus ulasan (hanya admin). */
  async deleteReview(reviewId) {
    return apiClient.del(`/reviews/${reviewId}`);
  },

  /** N ulasan terbaru dari semua karya published. */
  async getLatestReviews(limit = 4) {
    return apiClient.get(`/reviews/latest?limit=${limit}`);
  },
};

export default reviewService;
