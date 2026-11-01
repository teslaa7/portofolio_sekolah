/**
 * apiClient.js — HTTP client untuk backend Fastify.
 * Base URL diambil dari VITE_API_BASE_URL (default lokal: http://localhost:3001/api).
 *
 * Perilaku:
 * - Token disimpan di localStorage (key 'portofolio_token'), dibaca saat modul dimuat.
 * - Content-Type: application/json HANYA dikirim jika ada body (Fastify menolak body
 *   kosong pada DELETE / POST /auth/logout).
 * - TIDAK melempar error untuk respons 4xx; mengembalikan body JSON server apa adanya
 *   agar pemeriksaan res.success di halaman tetap bekerja.
 * - Jika server membalas 401: hapus token (logout otomatis) dan arahkan ke /login
 *   bila sedang berada di area /admin.
 * - Gagal jaringan: kembalikan {success:false, message, data:null}.
 */

const TOKEN_KEY = 'portofolio_token';
const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

export const apiClient = {
  baseUrl: BASE_URL,
  token: null,

  getToken() {
    if (this.token) return this.token;
    const stored = typeof localStorage !== 'undefined' ? localStorage.getItem(TOKEN_KEY) : null;
    this.token = stored || null;
    return this.token;
  },

  setToken(token) {
    this.token = token || null;
    if (token) {
      localStorage.setItem(TOKEN_KEY, token);
    } else {
      localStorage.removeItem(TOKEN_KEY);
    }
  },

  clearToken() {
    this.token = null;
    localStorage.removeItem(TOKEN_KEY);
  },

  async request(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    const hasBody = options.body !== undefined && options.body !== null;

    const headers = { ...(options.headers || {}) };
    if (hasBody) headers['Content-Type'] = 'application/json';
    const token = this.getToken();
    if (token) headers['Authorization'] = `Bearer ${token}`;

    let response;
    try {
      response = await fetch(url, {
        ...options,
        headers,
        body: hasBody ? options.body : undefined,
      });
    } catch {
      // Gagal jaringan / server tidak terjangkau
      return { success: false, message: 'Tidak dapat terhubung ke server. Coba lagi nanti.', data: null };
    }

    // 401: token tidak valid/kedaluwarsa -> logout otomatis
    if (response.status === 401) {
      this.clearToken();
      const path = typeof window !== 'undefined' ? window.location.pathname : '';
      if (path && path !== '/login' && path.startsWith('/admin')) {
        window.location.href = '/login';
      }
    }

    const data = await response.json().catch(() => ({}));
    return data;
  },

  get(endpoint, options = {}) {
    return this.request(endpoint, { ...options, method: 'GET' });
  },
  post(endpoint, body, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: 'POST',
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  },
  put(endpoint, body, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: 'PUT',
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  },
  del(endpoint, options = {}) {
    return this.request(endpoint, { ...options, method: 'DELETE' });
  },
};

// Baca token dari localStorage saat modul pertama kali dimuat
apiClient.getToken();

export default apiClient;
