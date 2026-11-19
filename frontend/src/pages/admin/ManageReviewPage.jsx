import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Trash2, RotateCcw, Star, ExternalLink, MessageSquare } from 'lucide-react';
import { reviewService } from '../../services/reviewService.js';
import { Button } from '../../components/common/Button.jsx';
import { SearchBar } from '../../components/common/SearchBar.jsx';
import { Select } from '../../components/common/Select.jsx';
import { Pagination } from '../../components/common/Pagination.jsx';
import { ConfirmDialog } from '../../components/common/ConfirmDialog.jsx';
import { SkeletonTableRows } from '../../components/common/LoadingSkeleton.jsx';
import { EmptyState } from '../../components/common/EmptyState.jsx';
import { StarRating } from '../../components/reviews/StarRating.jsx';
import { useToast } from '../../hooks/useToast.jsx';
import { formatShortDate } from '../../utils/formatDate.js';

const RATING_OPTIONS = [
  { value: '', label: 'Semua Rating' },
  { value: '5', label: '★★★★★  5 bintang' },
  { value: '4', label: '★★★★☆  4 bintang' },
  { value: '3', label: '★★★☆☆  3 bintang' },
  { value: '2', label: '★★☆☆☆  2 bintang' },
  { value: '1', label: '★☆☆☆☆  1 bintang' },
];

export function ManageReviewPage() {
  const toast = useToast();

  const [reviews, setReviews] = useState([]);
  const [meta, setMeta]       = useState({ page: 1, limit: 20, total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState('');
  const [rating, setRating] = useState('');
  const [page, setPage]     = useState(1);

  // Dialog hapus
  const [deleteOpen, setDeleteOpen]   = useState(false);
  const [deleting, setDeleting]       = useState(null);
  const [isDeleting, setIsDeleting]   = useState(false);

  const fetchReviews = useCallback(async () => {
    setLoading(true);
    try {
      const res = await reviewService.getAllReviews({ page, limit: 20, search, rating });
      if (res.success) {
        setReviews(res.data || []);
        setMeta(res.meta || { page: 1, limit: 20, total: 0, totalPages: 1 });
      } else {
        toast.error(res.message || 'Gagal memuat ulasan.');
      }
    } catch {
      toast.error('Terjadi kesalahan saat memuat ulasan.');
    } finally {
      setLoading(false);
    }
  }, [page, search, rating, toast]);

  useEffect(() => { fetchReviews(); }, [fetchReviews]);

  const handleReset = () => {
    setSearch('');
    setRating('');
    setPage(1);
  };

  const handleOpenDelete = (review) => {
    setDeleting(review);
    setDeleteOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deleting) return;
    setIsDeleting(true);
    try {
      const res = await reviewService.deleteReview(deleting.id);
      if (res.success) {
        toast.success('Ulasan berhasil dihapus.');
        setDeleteOpen(false);
        setDeleting(null);
        fetchReviews();
      } else {
        toast.error(res.message || 'Gagal menghapus ulasan.');
      }
    } catch {
      toast.error('Terjadi kesalahan saat menghapus ulasan.');
    } finally {
      setIsDeleting(false);
    }
  };

  const hasFilter = Boolean(search || rating);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-[#0F172A] font-heading">Kelola Ulasan</h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Pantau dan hapus ulasan yang tidak sesuai. Total {meta.total} ulasan.
        </p>
      </div>

      {/* Toolbar filter */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <SearchBar
          value={search}
          onChange={(val) => { setSearch(val); setPage(1); }}
          placeholder="Cari nama pengulas, komentar, atau judul karya..."
          className="flex-1"
        />
        <div className="flex gap-2 items-center flex-wrap sm:flex-nowrap">
          <Select
            value={rating}
            onChange={(e) => { setRating(e.target.value); setPage(1); }}
            options={RATING_OPTIONS}
            className="w-full sm:w-48"
          />
          {hasFilter && (
            <Button
              variant="ghost"
              size="sm"
              icon={RotateCcw}
              onClick={handleReset}
              className="text-slate-500 hover:text-rose-600 shrink-0"
            >
              Reset
            </Button>
          )}
        </div>
      </div>

      {/* Tabel ulasan */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-700">
            <thead className="bg-[#F5F8FF] text-xs uppercase font-semibold text-slate-500 border-b border-slate-200">
              <tr>
                <th className="py-3.5 px-6">Pengulas</th>
                <th className="py-3.5 px-6">Komentar</th>
                <th className="py-3.5 px-6">Rating</th>
                <th className="py-3.5 px-6">Karya</th>
                <th className="py-3.5 px-6">Tanggal</th>
                <th className="py-3.5 px-6 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <SkeletonTableRows count={8} />
              ) : reviews.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-14">
                    <EmptyState
                      icon={MessageSquare}
                      title="Tidak Ada Ulasan"
                      description={
                        hasFilter
                          ? 'Tidak ada ulasan yang cocok dengan filter. Coba reset filter.'
                          : 'Belum ada ulasan masuk dari pengunjung.'
                      }
                      actionLabel={hasFilter ? 'Reset Filter' : undefined}
                      onAction={hasFilter ? handleReset : undefined}
                    />
                  </td>
                </tr>
              ) : (
                reviews.map((review) => {
                  const initials = (review.name || 'T')
                    .split(' ').slice(0, 2)
                    .map((w) => w[0]?.toUpperCase() || '')
                    .join('');

                  return (
                    <tr key={review.id} className="hover:bg-slate-50/80 transition-colors">
                      {/* Pengulas */}
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2.5">
                          <div className="w-9 h-9 rounded-full bg-[#0B2E6B] text-white text-xs font-bold flex items-center justify-center shrink-0">
                            {initials}
                          </div>
                          <span className="font-medium text-slate-800 text-xs truncate max-w-[120px]">
                            {review.name}
                          </span>
                        </div>
                      </td>

                      {/* Komentar */}
                      <td className="py-4 px-6 max-w-[280px]">
                        <p className="text-xs text-slate-700 line-clamp-2 leading-relaxed">
                          {review.comment}
                        </p>
                      </td>

                      {/* Rating */}
                      <td className="py-4 px-6 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <StarRating value={review.rating} readonly size="sm" />
                          <span className="text-xs text-slate-500 font-medium">{review.rating}</span>
                        </div>
                      </td>

                      {/* Judul karya */}
                      <td className="py-4 px-6">
                        {review.portfolio_slug ? (
                          <Link
                            to={`/portofolio/${review.portfolio_slug}`}
                            target="_blank"
                            className="text-xs font-semibold text-[#0B2E6B] hover:underline inline-flex items-center gap-1 truncate max-w-[180px]"
                          >
                            <span className="truncate">{review.portfolio_title}</span>
                            <ExternalLink className="w-3 h-3 shrink-0" />
                          </Link>
                        ) : (
                          <span className="text-xs text-slate-400 italic">—</span>
                        )}
                      </td>

                      {/* Tanggal */}
                      <td className="py-4 px-6 text-xs text-slate-500 whitespace-nowrap">
                        {formatShortDate(review.created_at)}
                      </td>

                      {/* Aksi hapus */}
                      <td className="py-4 px-6 text-right">
                        <button
                          type="button"
                          onClick={() => handleOpenDelete(review)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          title="Hapus ulasan ini"
                          aria-label="Hapus ulasan"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {!loading && reviews.length > 0 && (
          <div className="border-t border-slate-100 px-4">
            <Pagination
              currentPage={meta.page}
              totalPages={meta.totalPages}
              totalItems={meta.total}
              itemsPerPage={meta.limit}
              onPageChange={(p) => { setPage(p); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
            />
          </div>
        )}
      </div>

      {/* Dialog konfirmasi hapus */}
      <ConfirmDialog
        isOpen={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleConfirmDelete}
        isLoading={isDeleting}
        title="Hapus Ulasan?"
        message={
          deleting
            ? `Hapus ulasan dari "${deleting.name}" pada karya "${deleting.portfolio_title}"? Tindakan ini tidak dapat dibatalkan.`
            : 'Apakah Anda yakin ingin menghapus ulasan ini?'
        }
        confirmText="Ya, Hapus Ulasan"
      />
    </div>
  );
}

export default ManageReviewPage;
