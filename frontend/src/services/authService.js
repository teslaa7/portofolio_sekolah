import { initialUsers } from '../data/mock/users.js';
import { apiClient } from './apiClient.js';

// In-memory state for user sessions
let usersStore = [...initialUsers];
let currentUser = null;

const simulateDelay = (ms = 350) => new Promise((resolve) => setTimeout(resolve, ms));

export const authService = {
  /**
   * Login user admin
   * @param {string} email
   * @param {string} password
   */
  async login(email, password) {
    await simulateDelay();

    const normalizedEmail = email?.trim().toLowerCase();
    const user = usersStore.find((u) => u.email.toLowerCase() === normalizedEmail);

    if (!user || user.password !== password) {
      return {
        success: false,
        message: 'Email atau password salah. Silakan periksa kembali kredensial Anda.',
        data: null,
      };
    }

    const { password: _, ...userWithoutPassword } = user;
    const token = 'dummy-fastify-jwt-token-' + Date.now();

    currentUser = userWithoutPassword;
    apiClient.setToken(token);

    return {
      success: true,
      message: 'Login berhasil. Selamat datang kembali, ' + user.name,
      data: {
        user: userWithoutPassword,
        token,
      },
    };
  },

  /**
   * Logout user
   */
  async logout() {
    await simulateDelay(150);
    currentUser = null;
    apiClient.clearToken();
    return {
      success: true,
      message: 'Berhasil keluar dari sistem.',
      data: null,
    };
  },

  /**
   * Mendapatkan profil user yang sedang aktif
   */
  async getCurrentUser() {
    await simulateDelay(100);
    return {
      success: true,
      message: currentUser ? 'Sesi ditemukan.' : 'Tidak ada sesi aktif.',
      data: currentUser,
    };
  },
};

export default authService;
