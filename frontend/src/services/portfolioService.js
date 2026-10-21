import { initialPortfolios } from '../data/mock/portfolios.js';
import { slugify } from '../utils/slugify.js';

// In-memory state holding the current portfolio list for this session
let portfoliosStore = [...initialPortfolios];

const simulateDelay = (ms = 350) => new Promise((resolve) => setTimeout(resolve, ms));

export const portfolioService = {
  /**
   * Mendapatkan daftar portofolio dengan filter, search, sort, dan pagination
   * @param {Object} params
   */
  async getPortfolios(params = {}) {
    await simulateDelay();

    const {
      page = 1,
      limit = 9,
      search = '',
      major = '',
      category_id = '',
      year = '',
      status = '', // 'published', 'draft', or '' (all)
      is_featured = null,
      sortBy = 'latest', // 'latest', 'oldest', 'a-z', 'z-a'
    } = params;

    let filtered = [...portfoliosStore];

    // Filter status
    if (status) {
      filtered = filtered.filter((p) => p.status === status);
    }

    // Filter featured
    if (is_featured !== null && is_featured !== undefined && is_featured !== '') {
      const featuredBool = is_featured === true || is_featured === 'true';
      filtered = filtered.filter((p) => Boolean(p.is_featured) === featuredBool);
    }

    // Filter jurusan
    if (major) {
      filtered = filtered.filter((p) => p.major.toLowerCase().includes(major.toLowerCase()));
    }

    // Filter kategori
    if (category_id) {
      filtered = filtered.filter((p) => Number(p.category_id) === Number(category_id));
    }

    // Filter tahun
    if (year) {
      filtered = filtered.filter((p) => Number(p.year) === Number(year));
    }

    // Search query (judul, deskripsi, nama murid, tech stack)
    if (search && search.trim()) {
      const q = search.trim().toLowerCase();
      filtered = filtered.filter((p) => {
        const titleMatch = p.title?.toLowerCase().includes(q);
        const descMatch = p.description?.toLowerCase().includes(q) || p.short_description?.toLowerCase().includes(q);
        const studentMatch = p.student_name?.toLowerCase().includes(q);
        const techMatch = p.tech_stack?.some((t) => t.toLowerCase().includes(q));
        return titleMatch || descMatch || studentMatch || techMatch;
      });
    }

    // Sorting
    filtered.sort((a, b) => {
      if (sortBy === 'oldest') {
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      }
      if (sortBy === 'a-z') {
        return a.title.localeCompare(b.title, 'id');
      }
      if (sortBy === 'z-a') {
        return b.title.localeCompare(a.title, 'id');
      }
      // default: latest
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });

    const total = filtered.length;
    const pageNum = Math.max(1, Number(page));
    const limitNum = Number(limit) > 0 ? Number(limit) : 9;
    const totalPages = Math.ceil(total / limitNum) || 1;
    const startIndex = (pageNum - 1) * limitNum;
    const paginatedItems = filtered.slice(startIndex, startIndex + limitNum);

    return {
      success: true,
      message: 'Data portofolio berhasil diambil',
      data: paginatedItems,
      meta: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages,
      },
    };
  },

  /**
   * Mendapatkan detail portofolio berdasarkan slug
   * @param {string} slug
   */
  async getPortfolioBySlug(slug) {
    await simulateDelay();
    const item = portfoliosStore.find((p) => p.slug === slug);
    if (!item) {
      return {
        success: false,
        message: 'Portofolio tidak ditemukan',
        data: null,
      };
    }
    return {
      success: true,
      message: 'Detail portofolio berhasil diambil',
      data: { ...item },
    };
  },

  /**
   * Mendapatkan detail portofolio berdasarkan ID (untuk panel admin)
   * @param {number|string} id
   */
  async getPortfolioById(id) {
    await simulateDelay();
    const item = portfoliosStore.find((p) => Number(p.id) === Number(id));
    if (!item) {
      return {
        success: false,
        message: 'Portofolio tidak ditemukan',
        data: null,
      };
    }
    return {
      success: true,
      message: 'Detail portofolio berhasil diambil',
      data: { ...item },
    };
  },

  /**
   * Mendapatkan portofolio terkait (sama kategori/jurusan selain id ini)
   * @param {number|string} currentId
   * @param {number|string} categoryId
   * @param {number} limit
   */
  async getRelatedPortfolios(currentId, categoryId, limit = 3) {
    await simulateDelay(200);
    const related = portfoliosStore
      .filter((p) => p.status === 'published' && Number(p.id) !== Number(currentId))
      .filter((p) => Number(p.category_id) === Number(categoryId))
      .slice(0, limit);

    // If not enough by category, pad with other published ones
    if (related.length < limit) {
      const others = portfoliosStore
        .filter((p) => p.status === 'published' && Number(p.id) !== Number(currentId) && !related.some((r) => r.id === p.id))
        .slice(0, limit - related.length);
      related.push(...others);
    }

    return {
      success: true,
      message: 'Data portofolio terkait berhasil diambil',
      data: related,
      meta: {
        total: related.length,
      },
    };
  },

  /**
   * Tambah portofolio baru (Admin)
   * @param {Object} payload
   */
  async createPortfolio(payload) {
    await simulateDelay();

    const newId = portfoliosStore.length > 0 ? Math.max(...portfoliosStore.map((p) => Number(p.id) || 0)) + 1 : 1;
    const baseSlug = slugify(payload.title || `portofolio-${newId}`);
    let slug = baseSlug;
    let counter = 1;
    while (portfoliosStore.some((p) => p.slug === slug)) {
      slug = `${baseSlug}-${counter++}`;
    }

    const now = new Date().toISOString();
    const newPortfolio = {
      id: newId,
      title: payload.title?.trim() || 'Tanpa Judul',
      slug,
      short_description: payload.short_description?.trim() || '',
      description: payload.description?.trim() || '',
      student_name: payload.student_name?.trim() || '',
      class_name: payload.class_name?.trim() || '',
      major: payload.major || 'Rekayasa Perangkat Lunak (RPL)',
      category_id: Number(payload.category_id) || 1,
      tech_stack: Array.isArray(payload.tech_stack) ? payload.tech_stack : [],
      project_url: payload.project_url?.trim() || '',
      repo_url: payload.repo_url?.trim() || '',
      thumbnail_url: payload.thumbnail_url?.trim() || `https://picsum.photos/seed/${slug}/600/400`,
      screenshots: Array.isArray(payload.screenshots) && payload.screenshots.length > 0
        ? payload.screenshots
        : [`https://picsum.photos/seed/${slug}-1/800/500`],
      year: Number(payload.year) || new Date().getFullYear(),
      status: payload.status || 'draft',
      is_featured: Boolean(payload.is_featured),
      created_at: now,
      updated_at: now,
    };

    portfoliosStore.unshift(newPortfolio);

    return {
      success: true,
      message: 'Portofolio baru berhasil ditambahkan.',
      data: newPortfolio,
    };
  },

  /**
   * Update portofolio yang ada (Admin)
   * @param {number|string} id
   * @param {Object} payload
   */
  async updatePortfolio(id, payload) {
    await simulateDelay();

    const index = portfoliosStore.findIndex((p) => Number(p.id) === Number(id));
    if (index === -1) {
      return {
        success: false,
        message: 'Portofolio tidak ditemukan untuk diperbarui.',
        data: null,
      };
    }

    const existing = portfoliosStore[index];
    let slug = existing.slug;
    if (payload.title && payload.title.trim() !== existing.title) {
      const baseSlug = slugify(payload.title);
      slug = baseSlug;
      let counter = 1;
      while (portfoliosStore.some((p) => p.slug === slug && Number(p.id) !== Number(id))) {
        slug = `${baseSlug}-${counter++}`;
      }
    }

    const updatedPortfolio = {
      ...existing,
      ...payload,
      id: existing.id, // preserve id
      slug: payload.slug ? slugify(payload.slug) : slug,
      category_id: payload.category_id !== undefined ? Number(payload.category_id) : existing.category_id,
      year: payload.year !== undefined ? Number(payload.year) : existing.year,
      is_featured: payload.is_featured !== undefined ? Boolean(payload.is_featured) : existing.is_featured,
      status: payload.status || existing.status,
      updated_at: new Date().toISOString(),
    };

    portfoliosStore[index] = updatedPortfolio;

    return {
      success: true,
      message: 'Portofolio berhasil diperbarui.',
      data: updatedPortfolio,
    };
  },

  /**
   * Hapus portofolio (Admin)
   * @param {number|string} id
   */
  async deletePortfolio(id) {
    await simulateDelay();

    const index = portfoliosStore.findIndex((p) => Number(p.id) === Number(id));
    if (index === -1) {
      return {
        success: false,
        message: 'Portofolio tidak ditemukan untuk dihapus.',
        data: null,
      };
    }

    const deleted = portfoliosStore.splice(index, 1)[0];

    return {
      success: true,
      message: `Portofolio "${deleted.title}" berhasil dihapus.`,
      data: deleted,
    };
  },
};

export default portfolioService;
