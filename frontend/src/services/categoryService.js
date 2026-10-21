import { initialCategories } from '../data/mock/categories.js';
import { initialPortfolios } from '../data/mock/portfolios.js';
import { slugify } from '../utils/slugify.js';

// In-memory state for categories
let categoriesStore = [...initialCategories];

const simulateDelay = (ms = 300) => new Promise((resolve) => setTimeout(resolve, ms));

export const categoryService = {
  /**
   * Mengambil semua daftar kategori
   */
  async getCategories() {
    await simulateDelay();
    return {
      success: true,
      message: 'Data kategori berhasil diambil',
      data: [...categoriesStore],
      meta: {
        total: categoriesStore.length,
      },
    };
  },

  /**
   * Mengambil detail kategori berdasarkan ID
   * @param {number|string} id
   */
  async getCategoryById(id) {
    await simulateDelay(150);
    const cat = categoriesStore.find((c) => Number(c.id) === Number(id));
    if (!cat) {
      return {
        success: false,
        message: 'Kategori tidak ditemukan',
        data: null,
      };
    }
    return {
      success: true,
      message: 'Detail kategori ditemukan',
      data: { ...cat },
    };
  },

  /**
   * Tambah kategori baru
   * @param {Object} payload { name, slug }
   */
  async createCategory(payload) {
    await simulateDelay();

    if (!payload.name || !payload.name.trim()) {
      return {
        success: false,
        message: 'Nama kategori tidak boleh kosong',
        data: null,
      };
    }

    const name = payload.name.trim();
    const slug = payload.slug ? slugify(payload.slug) : slugify(name);

    if (categoriesStore.some((c) => c.slug === slug || c.name.toLowerCase() === name.toLowerCase())) {
      return {
        success: false,
        message: 'Kategori dengan nama atau slug ini sudah terdaftar',
        data: null,
      };
    }

    const newId = categoriesStore.length > 0 ? Math.max(...categoriesStore.map((c) => Number(c.id) || 0)) + 1 : 1;
    const newCategory = {
      id: newId,
      name,
      slug,
    };

    categoriesStore.push(newCategory);

    return {
      success: true,
      message: `Kategori "${name}" berhasil ditambahkan`,
      data: newCategory,
    };
  },

  /**
   * Update kategori
   * @param {number|string} id
   * @param {Object} payload { name, slug }
   */
  async updateCategory(id, payload) {
    await simulateDelay();

    const index = categoriesStore.findIndex((c) => Number(c.id) === Number(id));
    if (index === -1) {
      return {
        success: false,
        message: 'Kategori tidak ditemukan untuk diedit',
        data: null,
      };
    }

    const name = payload.name?.trim() || categoriesStore[index].name;
    const slug = payload.slug ? slugify(payload.slug) : slugify(name);

    // Cek duplikasi jika nama/slug berubah
    const duplicate = categoriesStore.some(
      (c) => Number(c.id) !== Number(id) && (c.slug === slug || c.name.toLowerCase() === name.toLowerCase())
    );
    if (duplicate) {
      return {
        success: false,
        message: 'Nama atau slug kategori sudah digunakan oleh kategori lain',
        data: null,
      };
    }

    const updated = {
      ...categoriesStore[index],
      name,
      slug,
    };

    categoriesStore[index] = updated;

    return {
      success: true,
      message: 'Kategori berhasil diperbarui',
      data: updated,
    };
  },

  /**
   * Hapus kategori
   * @param {number|string} id
   */
  async deleteCategory(id) {
    await simulateDelay();

    const index = categoriesStore.findIndex((c) => Number(c.id) === Number(id));
    if (index === -1) {
      return {
        success: false,
        message: 'Kategori tidak ditemukan untuk dihapus',
        data: null,
      };
    }

    const deleted = categoriesStore.splice(index, 1)[0];

    return {
      success: true,
      message: `Kategori "${deleted.name}" berhasil dihapus`,
      data: deleted,
    };
  },
};

export default categoryService;
