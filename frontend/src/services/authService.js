import { apiClient } from './apiClient.js';

export const authService = {
  /**
   * Login user. Menyimpan token ke localStorage via apiClient bila sukses.
   * @returns {{success, message, data:{user, token}|null}}
   */
  async login(email, password) {
    const res = await apiClient.post('/auth/login', { email, password });
    if (res.success && res.data?.token) {
      apiClient.setToken(res.data.token);
    }
    return res;
  },

  /**
   * Logout. Menghapus token dari localStorage.
   */
  async logout() {
    const res = await apiClient.post('/auth/logout');
    apiClient.clearToken();
    return res || { success: true, message: 'Berhasil keluar dari sistem.', data: null };
  },

  /**
   * Ambil profil user yang sedang login (memanggil /auth/me bila ada token).
   * Tanpa token -> langsung kembalikan {success:false}.
   */
  async getCurrentUser() {
    if (!apiClient.getToken()) {
      return { success: false, message: 'Tidak ada sesi aktif.', data: null };
    }
    return apiClient.get('/auth/me');
  },
};

export default authService;
