import { initialPortfolios } from '../data/mock/portfolios.js';
import { slugify } from '../utils/slugify.js';
import { reviewService } from './reviewService.js';

// In-memory state holding the current portfolio list for this session
let portfoliosStore = [...initialPortfolios];

const simulateDelay = (ms = 350) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Enriches a portfolio item with rating data from reviewService.
 */
async function withRating(item) {
  const res = await reviewService.getRatingSummary(item.id);
  return {
    ...item,
    rating_avg: res.data?.average ?? 0,
    rating_count: res.data?.count ?? 0,
  };
}

async function withRatingBatch(items) {
  return Promise.all(items.map(withRating));
}

export const portfolioService = {
  /**
   * Mendapatkan daftar portofolio dengan filter, search, sort, dan pagination.
   * @param {Object} params
   * @param {Object|null} actor - user saat ini (untuk filter owner murid)
   */
  async getPortfolios(params = {}, actor = null) {
    await simulateDelay();

    const {
      page = 1,
      limit = 9,
      search = '',
      major = '',
      category_id = '',
      year = '',
      status = '',
      is_featured = null,
      sortBy = 'latest',
      owner_id = null, // filter karya milik user tertentu
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

    // Filter owner
    if (owner_id) {
      filtered = filtered.filter((p) => Number(p.owner_id) === Number(owner_id));
    }

    // Search query
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
      if (sortBy === 'oldest') return new Date(a.created_at) - new Date(b.created_at);
      if (sortBy === 'a-z') return a.title.localeCompare(b.title, 'id');
      if (sortBy === 'z-a') return b.title.localeCompare(a.title, 'id');
      // 'rating' — by rating_avg descending (resolved below after enrichment)
      return new Date(b.created_at) - new Date(a.created_at);
    });

    const total = filtered.length;
    const pageNum = Math.max(1, Number(page));
    const limitNum = Number(limit) > 0 ? Number(limit) : 9;
    const totalPages = Math.ceil(total / limitNum) || 1;
    const startIndex = (pageNum - 1) * limitNum;
    let paginatedItems = filtered.slice(startIndex, startIndex + limitNum);

    // Enrich with rating
    paginatedItems = await withRatingBatch(paginatedItems);

    // Sort by rating after enrichment
    if (sortBy === 'rating') {
      paginatedItems.sort((a, b) => b.rating_avg - a.rating_avg);
    }

    return {
      success: true,
      message: 'Data portofolio berhasil diambil',
      data: paginatedItems,
      meta: { page: pageNum, limit: limitNum, total, totalPages },
    };
  },

  /**
   * Mendapatkan detail portofolio berdasarkan slug.
   */
  async getPortfolioBySlug(slug) {
    await simulateDelay();
    const item = portfoliosStore.find((p) => p.slug === slug);
    if (!item) {
      return { success: false, message: 'Portofolio tidak ditemukan', data: null };
    }
    const enriched = await withRating(item);
    return { success: true, message: 'Detail portofolio berhasil diambil', data: enriched };
  },

  /**
   * Mendapatkan detail portofolio berdasarkan ID (untuk panel admin).
   */
  async getPortfolioById(id) {
    await simulateDelay();
    const item = portfoliosStore.find((p) => Number(p.id) === Number(id));
    if (!item) {
      return { success: false, message: 'Portofolio tidak ditemukan', data: null };
    }
    const enriched = await withRating(item);
    return { success: true, message: 'Detail portofolio berhasil diambil', data: enriched };
  },

  /**
   * Mendapatkan portofolio terkait.
   */
  async getRelatedPortfolios(currentId, categoryId, limit = 3) {
    await simulateDelay(200);
    const related = portfoliosStore
      .filter((p) => p.status === 'published' && Number(p.id) !== Number(currentId))
      .filter((p) => Number(p.category_id) === Number(categoryId))
      .slice(0, limit);

    if (related.length < limit) {
      const others = portfoliosStore
        .filter(
          (p) =>
            p.status === 'published' &&
            Number(p.id) !== Number(currentId) &&
            !related.some((r) => r.id === p.id)
        )
        .slice(0, limit - related.length);
      related.push(...others);
    }

    const enriched = await withRatingBatch(related);
    return { success: true, message: 'Data portofolio terkait berhasil diambil', data: enriched, meta: { total: enriched.length } };
  },

  /**
   * Tambah portofolio baru.
   * @param {Object} payload
   * @param {Object|null} actor - user yang membuat (null = admin)
   */
  async createPortfolio(payload, actor = null) {
    await simulateDelay();

    const newId =
      portfoliosStore.length > 0
        ? Math.max(...portfoliosStore.map((p) => Number(p.id) || 0)) + 1
        : 1;
    const baseSlug = slugify(payload.title || `portofolio-${newId}`);
    let slug = baseSlug;
    let counter = 1;
    while (portfoliosStore.some((p) => p.slug === slug)) {
      slug = `${baseSlug}-${counter++}`;
    }

    const now = new Date().toISOString();
    const isStudent = actor?.role === 'student';

    const newPortfolio = {
      id: newId,
      owner_id: actor?.id ?? null,
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
      thumbnail_url:
        payload.thumbnail_url?.trim() ||
        `https://picsum.photos/seed/${slug}/600/400`,
      screenshots:
        Array.isArray(payload.screenshots) && payload.screenshots.length > 0
          ? payload.screenshots
          : [`https://picsum.photos/seed/${slug}-1/800/500`],
      year: Number(payload.year) || new Date().getFullYear(),
      // Murid default published, is_featured selalu false
      status: isStudent ? (payload.status || 'published') : (payload.status || 'draft'),
      is_featured: isStudent ? false : Boolean(payload.is_featured),
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
   * Update portofolio yang ada.
   * @param {number|string} id
   * @param {Object} payload
   * @param {Object|null} actor - user yang mengubah
   */
  async updatePortfolio(id, payload, actor = null) {
    await simulateDelay();

    const index = portfoliosStore.findIndex((p) => Number(p.id) === Number(id));
    if (index === -1) {
      return { success: false, message: 'Portofolio tidak ditemukan untuk diperbarui.', data: null };
    }

    const existing = portfoliosStore[index];

    // Akses kontrol: murid hanya bisa ubah miliknya sendiri
    if (actor?.role === 'student' && existing.owner_id !== actor.id) {
      return {
        success: false,
        message: 'Anda hanya dapat mengubah karya milik sendiri.',
        data: null,
      };
    }

    let slug = existing.slug;
    if (payload.title && payload.title.trim() !== existing.title) {
      const baseSlug = slugify(payload.title);
      slug = baseSlug;
      let counter = 1;
      while (portfoliosStore.some((p) => p.slug === slug && Number(p.id) !== Number(id))) {
        slug = `${baseSlug}-${counter++}`;
      }
    }

    const isStudent = actor?.role === 'student';
    const updatedPortfolio = {
      ...existing,
      ...payload,
      id: existing.id,
      owner_id: existing.owner_id, // tidak bisa diubah
      slug: payload.slug ? slugify(payload.slug) : slug,
      category_id:
        payload.category_id !== undefined ? Number(payload.category_id) : existing.category_id,
      year: payload.year !== undefined ? Number(payload.year) : existing.year,
      // Murid tidak bisa ubah is_featured
      is_featured: isStudent
        ? existing.is_featured
        : payload.is_featured !== undefined
        ? Boolean(payload.is_featured)
        : existing.is_featured,
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
   * Hapus portofolio.
   * @param {number|string} id
   * @param {Object|null} actor
   */
  async deletePortfolio(id, actor = null) {
    await simulateDelay();

    const index = portfoliosStore.findIndex((p) => Number(p.id) === Number(id));
    if (index === -1) {
      return { success: false, message: 'Portofolio tidak ditemukan untuk dihapus.', data: null };
    }

    const existing = portfoliosStore[index];

    // Akses kontrol
    if (actor?.role === 'student' && existing.owner_id !== actor.id) {
      return {
        success: false,
        message: 'Anda hanya dapat menghapus karya milik sendiri.',
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
