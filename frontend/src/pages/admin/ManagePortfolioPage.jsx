import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  Star,
  ExternalLink,
  RotateCcw,
  CheckCircle2,
  Clock,
} from 'lucide-react';
import { portfolioService } from '../../services/portfolioService.js';
import { categoryService } from '../../services/categoryService.js';
import { Button } from '../../components/common/Button.jsx';
import { SearchBar } from '../../components/common/SearchBar.jsx';
import { Select } from '../../components/common/Select.jsx';
import { StatusBadge } from '../../components/common/StatusBadge.jsx';
import { Pagination } from '../../components/common/Pagination.jsx';
import { ConfirmDialog } from '../../components/common/ConfirmDialog.jsx';
import { SkeletonTableRows } from '../../components/common/LoadingSkeleton.jsx';
import { EmptyState } from '../../components/common/EmptyState.jsx';
import { useToast } from '../../hooks/useToast.jsx';
import { MAJORS } from '../../constants/roles.js';
import { formatShortDate } from '../../utils/formatDate.js';

export function ManagePortfolioPage() {
  const toast = useToast();

  const [portfolios, setPortfolios] = useState([]);
  const [categories, setCategories] = useState([]);
  const [meta, setMeta] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [major, setMajor] = useState('');
  const [page, setPage] = useState(1);

  // Delete modal state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedPortfolio, setSelectedPortfolio] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Load categories
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

  const fetchPortfolios = useCallback(async () => {
    setLoading(true);
    try {
      const res = await portfolioService.getPortfolios({
        page,
        limit: 10,
        search,
        status,
        major,
        sortBy: 'latest',
      });
      if (res.success) {
        setPortfolios(res.data || []);
        setMeta(res.meta || { page: 1, limit: 10, total: 0, totalPages: 1 });
      }
    } catch (err) {
      toast.error('Gagal mengambil data portofolio: ' + err.message);
    } finally {
      setLoading(false);
    }
  }, [page, search, status, major, toast]);

  useEffect(() => {
    fetchPortfolios();
  }, [fetchPortfolios]);

  const handleOpenDelete = (item) => {
    setSelectedPortfolio(item);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedPortfolio) return;
    setIsDeleting(true);
    try {
      const res = await portfolioService.deletePortfolio(selectedPortfolio.id);
      if (res.success) {
        toast.success(res.message);
        setDeleteModalOpen(false);
        setSelectedPortfolio(null);
        fetchPortfolios();
      } else {
        toast.error(res.message);
      }
    } catch (err) {
      toast.error('Gagal menghapus portofolio: ' + err.message);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleResetFilters = () => {
    setSearch('');
    setStatus('');
    setMajor('');
    setPage(1);
  };

  const categoryMap = categories.reduce((acc, cat) => {
    acc[cat.id] = cat.name;
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#0F172A] font-heading">
            Daftar Portofolio Karya Siswa
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Total {meta.total} karya terdata di seluruh jurusan kejuruan.
          </p>
        </div>

        <Link to="/admin/portofolio/tambah">
          <Button variant="primary" size="md" icon={Plus}>
            Tambah Portofolio
          </Button>
        </Link>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs flex flex-col md:flex-row items-stretch md:items-center gap-3">
        <SearchBar
          value={search}
          onChange={(val) => {
            setSearch(val);
            setPage(1);
          }}
          placeholder="Cari judul, nama siswa, atau teknologi..."
          className="flex-1"
        />

        <div className="flex flex-wrap sm:flex-nowrap gap-2 items-center">
          <Select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(1);
            }}
            options={[
              { value: '', label: 'Semua Status' },
              { value: 'published', label: 'Dipublikasi' },
              { value: 'draft', label: 'Draft' },
            ]}
            className="w-full sm:w-40"
          />

          <Select
            value={major}
            onChange={(e) => {
              setMajor(e.target.value);
              setPage(1);
            }}
            options={[
              { value: '', label: 'Semua Jurusan' },
              ...MAJORS.map((m) => ({ value: m, label: m })),
            ]}
            className="w-full sm:w-48"
          />

          {(search || status || major) && (
            <Button
              variant="ghost"
              size="sm"
              icon={RotateCcw}
              onClick={handleResetFilters}
              className="text-slate-500 hover:text-rose-600"
            >
              Reset
            </Button>
          )}
        </div>
      </div>

      {/* Table Data */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-700">
            <thead className="bg-[#F5F8FF] text-xs uppercase font-semibold text-slate-500 border-b border-slate-200">
              <tr>
                <th className="py-3.5 px-6">Karya</th>
                <th className="py-3.5 px-6">Siswa & Kelas</th>
                <th className="py-3.5 px-6">Jurusan & Kategori</th>
                <th className="py-3.5 px-6">Tahun</th>
                <th className="py-3.5 px-6">Status</th>
                <th className="py-3.5 px-6 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <SkeletonTableRows count={6} />
              ) : portfolios.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12">
                    <EmptyState
                      title="Tidak Ada Data Portofolio"
                      description="Tidak ada data portofolio yang cocok dengan filter atau pencarian Anda."
                      actionLabel="Reset Filter"
                      onAction={handleResetFilters}
                    />
                  </td>
                </tr>
              ) : (
                portfolios.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                    {/* Thumbnail & Title */}
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <img
                          src={item.thumbnail_url}
                          alt={item.title}
                          className="w-14 h-11 rounded-lg object-cover border border-slate-200 shrink-0"
                          onError={(e) => {
                            e.currentTarget.src = `https://picsum.photos/seed/${item.slug}/600/400`;
                          }}
                        />
                        <div className="max-w-xs">
                          <Link
                            to={`/portofolio/${item.slug}`}
                            target="_blank"
                            className="font-bold text-[#0F172A] hover:text-[#0B2E6B] transition-colors truncate block"
                          >
                            {item.title}
                          </Link>
                          <div className="flex items-center gap-2 mt-1">
                            {item.is_featured && (
                              <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                                <Star className="w-3 h-3 fill-amber-400 text-amber-500" />
                                Unggulan
                              </span>
                            )}
                            <span className="text-[11px] text-slate-400 truncate">
                              {item.short_description}
                            </span>
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Student & Class */}
                    <td className="py-4 px-6">
                      <p className="font-semibold text-slate-800 text-xs">{item.student_name}</p>
                      <p className="text-[11px] text-slate-400">{item.class_name}</p>
                    </td>

                    {/* Major & Category */}
                    <td className="py-4 px-6">
                      <p className="text-xs text-slate-700 truncate max-w-[160px]">{item.major}</p>
                      <p className="text-[11px] text-blue-600 font-medium">
                        {categoryMap[item.category_id] || 'Kategori Lain'}
                      </p>
                    </td>

                    {/* Year */}
                    <td className="py-4 px-6 text-xs text-slate-600 font-medium">
                      {item.year}
                    </td>

                    {/* Status Badge */}
                    <td className="py-4 px-6">
                      <StatusBadge status={item.status} />
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-6 text-right whitespace-nowrap">
                      <div className="inline-flex items-center gap-1">
                        <Link
                          to={`/portofolio/${item.slug}`}
                          target="_blank"
                          className="p-1.5 text-slate-400 hover:text-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
                          title="Lihat Pratinjau Publik"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>

                        <Link
                          to={`/admin/portofolio/${item.id}/edit`}
                          className="p-1.5 text-slate-400 hover:text-emerald-600 rounded-lg hover:bg-emerald-50 transition-colors"
                          title="Edit Portofolio"
                        >
                          <Edit className="w-4 h-4" />
                        </Link>

                        <button
                          type="button"
                          onClick={() => handleOpenDelete(item)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                          title="Hapus Portofolio"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {!loading && portfolios.length > 0 && (
          <div className="border-t border-slate-100 px-4">
            <Pagination
              currentPage={meta.page}
              totalPages={meta.totalPages}
              totalItems={meta.total}
              itemsPerPage={meta.limit}
              onPageChange={(p) => setPage(p)}
            />
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmDialog
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        isLoading={isDeleting}
        title="Hapus Portofolio Karya?"
        message={`Apakah Anda yakin ingin menghapus karya "${selectedPortfolio?.title}"? Karya ini akan dihapus dari daftar galeri sekolah.`}
        confirmText="Ya, Hapus Karya"
      />
    </div>
  );
}

export default ManagePortfolioPage;
