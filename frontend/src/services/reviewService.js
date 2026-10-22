import { initialReviews } from '../data/mock/reviews.js';

// In-memory store
let reviewsStore = [...initialReviews];
let nextId = reviewsStore.length + 1;

const simulateDelay = (ms = 300) => new Promise((resolve) => setTimeout(resolve, ms));

export const reviewService = {
  /**
   * Ambil daftar ulasan untuk satu portofolio, terbaru dulu.
   * @param {number|string} portfolioId
   * @param {{ page?: number, limit?: number }} opts
   */
  async getReviews(portfolioId, { page = 1, limit = 10 } = {}) {
    await simulateDelay();
    const all = reviewsStore
      .filter((r) => Number(r.portfolio_id) === Number(portfolioId))
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    const total = all.length;
    const totalPages = Math.ceil(total / limit) || 1;
    const start = (page - 1) * limit;
    const data = all.slice(start, start + limit);

    return {
      success: true,
      message: 'Ulasan berhasil diambil.',
      data,
      meta: { page, limit, total, totalPages },
    };
  },

  /**
   * Ringkasan rating untuk satu portofolio.
   * @param {number|string} portfolioId
   * @returns {{ average: number, count: number, distribution: {1:n,2:n,3:n,4:n,5:n} }}
   */
  async getRatingSummary(portfolioId) {
    await simulateDelay(150);
    const list = reviewsStore.filter(
      (r) => Number(r.portfolio_id) === Number(portfolioId)
    );

    const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    let total = 0;
    list.forEach((r) => {
      distribution[r.rating] = (distribution[r.rating] || 0) + 1;
      total += r.rating;
    });

    const count = list.length;
    const average = count > 0 ? Math.round((total / count) * 10) / 10 : 0;

    return {
      success: true,
      message: 'Ringkasan rating berhasil diambil.',
      data: { average, count, distribution },
    };
  },

  /**
   * Tambah ulasan baru. Satu user_id (atau nama+portfolio bagi tamu) hanya boleh satu rating.
   * Kirim ulang akan memperbarui rating & komentar lama.
   * @param {number|string} portfolioId
   * @param {{ name: string, rating: number, comment: string, user_id?: number|null }} payload
   */
  async addReview(portfolioId, { name, rating, comment, user_id = null }) {
    await simulateDelay();

    // Validasi
    const errors = [];
    if (!rating || rating < 1 || rating > 5) {
      errors.push({ field: 'rating', message: 'Rating wajib dipilih (1–5 bintang).' });
    }
    if (!comment || comment.trim().length < 5) {
      errors.push({ field: 'comment', message: 'Komentar minimal 5 karakter.' });
    }
    if (comment && comment.trim().length > 500) {
      errors.push({ field: 'comment', message: 'Komentar maksimal 500 karakter.' });
    }
    if (!name || !name.trim()) {
      errors.push({ field: 'name', message: 'Nama wajib diisi.' });
    }
    if (errors.length > 0) {
      return { success: false, message: 'Data ulasan tidak valid.', errors, data: null };
    }

    // Cek apakah user sudah pernah memberi rating (update, bukan duplikat)
    let existingIndex = -1;
    if (user_id) {
      existingIndex = reviewsStore.findIndex(
        (r) => Number(r.portfolio_id) === Number(portfolioId) && r.user_id === user_id
      );
    } else {
      // Tamu: identifikasi berdasarkan nama (case-insensitive) + portfolio
      existingIndex = reviewsStore.findIndex(
        (r) =>
          Number(r.portfolio_id) === Number(portfolioId) &&
          !r.user_id &&
          r.name.trim().toLowerCase() === name.trim().toLowerCase()
      );
    }

    const now = new Date().toISOString();

    if (existingIndex !== -1) {
      // Perbarui ulasan lama
      reviewsStore[existingIndex] = {
        ...reviewsStore[existingIndex],
        name: name.trim(),
        rating: Number(rating),
        comment: comment.trim(),
        created_at: now,
      };
      return {
        success: true,
        message: 'Ulasan Anda berhasil diperbarui.',
        data: { ...reviewsStore[existingIndex] },
      };
    }

    // Ulasan baru
    const newReview = {
      id: nextId++,
      portfolio_id: Number(portfolioId),
      user_id: user_id || null,
      name: name.trim(),
      rating: Number(rating),
      comment: comment.trim(),
      created_at: now,
    };
    reviewsStore.unshift(newReview);

    return {
      success: true,
      message: 'Ulasan berhasil ditambahkan. Terima kasih!',
      data: { ...newReview },
    };
  },

  /**
   * Hapus ulasan. Hanya admin atau pemilik ulasan.
   * @param {number|string} reviewId
   * @param {{ role: string, id: number }} actor
   */
  async deleteReview(reviewId, actor) {
    await simulateDelay();

    const index = reviewsStore.findIndex((r) => Number(r.id) === Number(reviewId));
    if (index === -1) {
      return { success: false, message: 'Ulasan tidak ditemukan.', data: null };
    }

    const review = reviewsStore[index];
    const isAdmin = actor?.role === 'admin';
    const isOwner = actor?.id && review.user_id === actor.id;

    if (!isAdmin && !isOwner) {
      return {
        success: false,
        message: 'Anda tidak memiliki izin untuk menghapus ulasan ini.',
        data: null,
      };
    }

    reviewsStore.splice(index, 1);
    return { success: true, message: 'Ulasan berhasil dihapus.', data: null };
  },

  /**
   * Ambil N ulasan terbaru dari semua karya (untuk bagian Beranda).
   * @param {number} limit
   */
  async getLatestReviews(limit = 4) {
    await simulateDelay(200);
    const sorted = [...reviewsStore].sort(
      (a, b) => new Date(b.created_at) - new Date(a.created_at)
    );
    return {
      success: true,
      message: 'Ulasan terbaru berhasil diambil.',
      data: sorted.slice(0, limit),
    };
  },

  /**
   * Hitung total ulasan di semua portofolio.
   */
  async getTotalReviews() {
    await simulateDelay(100);
    return { success: true, data: reviewsStore.length };
  },

  /**
   * Hitung rata-rata rating global semua portofolio.
   */
  async getGlobalAverageRating() {
    await simulateDelay(100);
    if (reviewsStore.length === 0) return { success: true, data: 0 };
    const sum = reviewsStore.reduce((acc, r) => acc + r.rating, 0);
    const avg = Math.round((sum / reviewsStore.length) * 10) / 10;
    return { success: true, data: avg };
  },
};

export default reviewService;
