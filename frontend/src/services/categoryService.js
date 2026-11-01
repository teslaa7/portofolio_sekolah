import { apiClient } from './apiClient.js';

export const categoryService = {
  /** Daftar semua kategori. */
  async getCategories() {
    return apiClient.get('/categories');
  },

  /** Detail kategori berdasarkan ID. */
  async getCategoryById(id) {
    return apiClient.get(`/categories/${id}`);
  },

  /** Tambah kategori baru. */
  async createCategory(payload) {
    return apiClient.post('/categories', payload);
  },

  /** Update kategori. */
  async updateCategory(id, payload) {
    return apiClient.put(`/categories/${id}`, payload);
  },

  /** Hapus kategori (gagal 409 jika masih dipakai portofolio). */
  async deleteCategory(id) {
    return apiClient.del(`/categories/${id}`);
  },
};

export default categoryService;
