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

  /** Kirim ulasan (upsert berdasarkan nama). */
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

  /** Ulasan pada karya milik user yang sedang login. */
  async getMyReviews({ page = 1, limit = 10 } = {}) {
    return apiClient.get(`/reviews/mine?page=${page}&limit=${limit}`);
  },

  /** Ulasan pada karya published milik murid lain. */
  async getCommunityReviews({ page = 1, limit = 10 } = {}) {
    return apiClient.get(`/reviews/community?page=${page}&limit=${limit}`);
  },

  /** Semua ulasan (hanya admin), dengan search + filter rating. */
  async getAllReviews({ page = 1, limit = 20, search = '', rating = '' } = {}) {
    const params = new URLSearchParams({ page, limit });
    if (search) params.set('search', search);
    if (rating) params.set('rating', rating);
    return apiClient.get(`/reviews?${params.toString()}`);
  },
};

export default reviewService;
