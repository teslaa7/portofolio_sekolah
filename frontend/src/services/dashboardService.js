import { portfolioService } from './portfolioService.js';
import { categoryService } from './categoryService.js';
import { MAJORS } from '../constants/roles.js';

const simulateDelay = (ms = 350) => new Promise((resolve) => setTimeout(resolve, ms));

export const dashboardService = {
  /**
   * Mengambil statistik ringkasan untuk admin dashboard
   */
  async getSummary() {
    await simulateDelay();

    // Ambil data portofolio terbaru
    const portfoliosRes = await portfolioService.getPortfolios({ limit: 1000, sortBy: 'latest' });
    const allPortfolios = portfoliosRes.data || [];

    const categoriesRes = await categoryService.getCategories();
    const categories = categoriesRes.data || [];

    const total = allPortfolios.length;
    const published = allPortfolios.filter((p) => p.status === 'published').length;
    const draft = allPortfolios.filter((p) => p.status === 'draft').length;
    const featured = allPortfolios.filter((p) => Boolean(p.is_featured)).length;

    // Hitung karya per jurusan
    const majorStatsMap = {
      RPL: 0,
      TKJ: 0,
      Multimedia: 0,
      Akuntansi: 0,
      Lainnya: 0,
    };

    allPortfolios.forEach((item) => {
      const m = item.major || '';
      if (m.includes('RPL') || m.includes('Rekayasa')) {
        majorStatsMap.RPL += 1;
      } else if (m.includes('TKJ') || m.includes('Jaringan')) {
        majorStatsMap.TKJ += 1;
      } else if (m.includes('Multimedia') || m.includes('DKV') || m.includes('Desain')) {
        majorStatsMap.Multimedia += 1;
      } else if (m.includes('Akuntansi')) {
        majorStatsMap.Akuntansi += 1;
      } else {
        majorStatsMap.Lainnya += 1;
      }
    });

    const majorChartData = [
      { name: 'RPL', total: majorStatsMap.RPL, fullName: 'Rekayasa Perangkat Lunak' },
      { name: 'TKJ', total: majorStatsMap.TKJ, fullName: 'Teknik Komputer & Jaringan' },
      { name: 'Multimedia', total: majorStatsMap.Multimedia, fullName: 'Desain Komunikasi Visual' },
      { name: 'Akuntansi', total: majorStatsMap.Akuntansi, fullName: 'Akuntansi Keuangan' },
    ];

    // 5 karya terbaru
    const latestPortfolios = allPortfolios.slice(0, 5);

    return {
      success: true,
      message: 'Statistik dashboard berhasil diambil',
      data: {
        summary: {
          total,
          published,
          draft,
          featured,
          categoriesCount: categories.length,
        },
        majorChartData,
        latestPortfolios,
      },
    };
  },
};

export default dashboardService;
