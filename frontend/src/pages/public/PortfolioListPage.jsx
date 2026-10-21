import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { portfolioService } from '../../services/portfolioService.js';
import { categoryService } from '../../services/categoryService.js';
import { PortfolioFilter } from '../../components/portfolio/PortfolioFilter.jsx';
import { PortfolioGrid } from '../../components/portfolio/PortfolioGrid.jsx';
import { Pagination } from '../../components/common/Pagination.jsx';
import { ErrorState } from '../../components/common/ErrorState.jsx';

export function PortfolioListPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  const [categories, setCategories] = useState([]);
  const [portfolios, setPortfolios] = useState([]);
  const [meta, setMeta] = useState({ page: 1, limit: 9, total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters state initialized from query params
  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    major: searchParams.get('major') || '',
    category_id: searchParams.get('category_id') || '',
    year: searchParams.get('year') || '',
    sortBy: searchParams.get('sortBy') || 'latest',
    page: Number(searchParams.get('page')) || 1,
  });

  // Load categories once
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const res = await categoryService.getCategories();
        setCategories(res.data || []);
      } catch (err) {
        console.error('Error fetching categories:', err);
      }
    };
    loadCategories();
  }, []);

  // Fetch portfolios whenever filters change
  const fetchPortfolios = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await portfolioService.getPortfolios({
        status: 'published', // Public page only sees published
        search: filters.search,
        major: filters.major,
        category_id: filters.category_id,
        year: filters.year,
        sortBy: filters.sortBy,
        page: filters.page,
        limit: 9,
      });

      if (res.success) {
        setPortfolios(res.data || []);
        setMeta(res.meta || { page: 1, limit: 9, total: 0, totalPages: 1 });
      } else {
        setError(res.message || 'Gagal memuat portofolio');
      }
    } catch (err) {
      setError(err.message || 'Terjadi kesalahan sistem');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchPortfolios();
  }, [fetchPortfolios]);

  // Sync state changes with URL query params
  const handleFilterChange = (key, value) => {
    setFilters((prev) => {
      const updated = { ...prev, [key]: value, page: 1 }; // Reset to page 1 on filter change
      const newParams = new URLSearchParams();
      Object.entries(updated).forEach(([k, v]) => {
        if (v) newParams.set(k, v);
      });
      setSearchParams(newParams);
      return updated;
    });
  };

  const handlePageChange = (newPage) => {
    setFilters((prev) => {
      const updated = { ...prev, page: newPage };
      const newParams = new URLSearchParams(searchParams);
      newParams.set('page', newPage);
      setSearchParams(newParams);
      return updated;
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleResetFilters = () => {
    setFilters({
      search: '',
      major: '',
      category_id: '',
      year: '',
      sortBy: 'latest',
      page: 1,
    });
    setSearchParams(new URLSearchParams());
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-[#0F172A] font-heading">
          Galeri Portofolio Siswa
        </h1>
        <p className="text-sm sm:text-base text-slate-500 mt-2 max-w-2xl">
          Eksplorasi seluruh karya website, prototipe aplikasi, dan sistem informasi yang telah diselesaikan oleh siswa sekolah kami.
        </p>
      </div>

      {/* Filter Component */}
      <PortfolioFilter
        filters={filters}
        categories={categories}
        onFilterChange={handleFilterChange}
        onReset={handleResetFilters}
      />

      {/* Content */}
      {error ? (
        <ErrorState message={error} onRetry={fetchPortfolios} />
      ) : (
        <>
          <PortfolioGrid
            portfolios={portfolios}
            categories={categories}
            isLoading={loading}
            emptyTitle="Tidak Ada Karya Sesuai Filter"
            emptyDescription="Tidak ada karya yang sesuai dengan kata kunci atau filter yang Anda pilih. Coba bersihkan filter."
            onResetFilter={handleResetFilters}
          />

          {/* Pagination */}
          {!loading && portfolios.length > 0 && (
            <Pagination
              currentPage={meta.page}
              totalPages={meta.totalPages}
              totalItems={meta.total}
              itemsPerPage={meta.limit}
              onPageChange={handlePageChange}
              className="mt-8"
            />
          )}
        </>
      )}
    </div>
  );
}

export default PortfolioListPage;
