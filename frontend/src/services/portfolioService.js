import { apiClient } from './apiClient.js';

// Key query yang dikenali backend GET /portfolios
const PORTFOLIO_QUERY_KEYS = [
  'page',
  'limit',
  'search',
  'major',
  'category_id',
  'year',
  'status',
  'is_featured',
  'sortBy',
  'mine',
  'owner_id',
];

function buildQuery(params = {}) {
  const q = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (
      PORTFOLIO_QUERY_KEYS.includes(key) &&
      value !== undefined &&
      value !== null &&
      value !== ''
    ) {
      q.append(key, value);
    }
  });
  const s = q.toString();
  return s ? `?${s}` : '';
}

export const portfolioService = {
  /** Daftar portofolio dengan filter/search/pagination. */
  async getPortfolios(params = {}) {
    return apiClient.get(`/portfolios${buildQuery(params)}`);
  },

  /** Detail portofolio berdasarkan slug (publik). */
  async getPortfolioBySlug(slug) {
    return apiClient.get(`/portfolios/${slug}`);
  },

  /** Detail portofolio berdasarkan ID (admin atau pemilik). */
  async getPortfolioById(id) {
    return apiClient.get(`/admin/portfolios/${id}`);
  },

  /** Portofolio terkait berdasarkan kategori. */
  async getRelatedPortfolios(currentId, categoryId, limit = 3) {
    return apiClient.get(
      `/portfolios/related?exclude_id=${currentId}&category_id=${categoryId}&limit=${limit}`
    );
  },

  /** Tambah portofolio baru (admin/murid; kepemilikan ditegakkan backend). */
  async createPortfolio(payload) {
    return apiClient.post('/portfolios', payload);
  },

  /** Update portofolio (admin/murid; izin ditegakkan backend). */
  async updatePortfolio(id, payload) {
    return apiClient.put(`/portfolios/${id}`, payload);
  },

  /** Hapus portofolio (admin semua; murid hanya miliknya). */
  async deletePortfolio(id) {
    return apiClient.del(`/portfolios/${id}`);
  },
};

export default portfolioService;
