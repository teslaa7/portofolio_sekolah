import { apiClient } from './apiClient.js';

export const authService = {
  async login(email, password) {
    const res = await apiClient.post('/auth/login', { email, password });
    if (res.success && res.data?.token) apiClient.setToken(res.data.token);
    return res;
  },

  async register(payload) {
    const res = await apiClient.post('/auth/register', payload);
    if (res.success && res.data?.token) apiClient.setToken(res.data.token);
    return res;
  },

  async logout() {
    const res = await apiClient.post('/auth/logout');
    apiClient.clearToken();
    return res || { success: true, message: 'Berhasil keluar dari sistem.', data: null };
  },

  async getCurrentUser() {
    if (!apiClient.getToken()) {
      return { success: false, message: 'Tidak ada sesi aktif.', data: null };
    }
    return apiClient.get('/auth/me');
  },

  /** Update profil (name, avatar, class_name, major). */
  async updateProfile(payload) {
    return apiClient.put('/auth/profile', payload);
  },

  /** Ganti password. */
  async changePassword(payload) {
    return apiClient.put('/auth/password', payload);
  },
};

export default authService;
