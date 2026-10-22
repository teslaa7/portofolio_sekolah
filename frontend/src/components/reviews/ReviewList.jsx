import React, { useState } from 'react';
import { Trash2 } from 'lucide-react';
import { EmptyState } from '../common/EmptyState.jsx';
import { ConfirmDialog } from '../common/ConfirmDialog.jsx';
import { StarRating } from './StarRating.jsx';
import { formatDate } from '../../utils/formatDate.js';

const PAGE_SIZE = 5;

/**
 * Daftar ulasan dengan "Muat lebih banyak" dan tombol hapus untuk admin.
 * @param {Array} reviews         - array ulasan
 * @param {object|null} currentUser
 * @param {function} onDelete     - (reviewId) => void
 * @param {boolean} isDeleting
 */
export function ReviewList({ reviews = [], currentUser = null, onDelete, isDeleting = false }) {
  const [visible, setVisible] = useState(PAGE_SIZE);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [targetId, setTargetId] = useState(null);

  const isAdmin = currentUser?.role === 'admin';
  const shown = reviews.slice(0, visible);
  const hasMore = visible < reviews.length;

  const handleDeleteClick = (id) => {
    setTargetId(id);
    setConfirmOpen(true);
  };

  const handleConfirmDelete = () => {
    if (targetId != null) {
      onDelete?.(targetId);
    }
    setConfirmOpen(false);
    setTargetId(null);
  };

  if (reviews.length === 0) {
    return (
      <EmptyState
        title="Belum Ada Ulasan"
        description="Jadilah yang pertama memberikan ulasan dan rating untuk karya ini!"
      />
    );
  }

  return (
    <>
      <div className="space-y-4">
        {shown.map((review) => {
          const initials = review.name
            .split(' ')
            .slice(0, 2)
            .map((w) => w[0]?.toUpperCase() || '')
            .join('');

          return (
            <div
              key={review.id}
              className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  {/* Avatar inisial */}
                  <div className="w-10 h-10 rounded-full bg-[#0B2E6B] text-white text-sm font-bold flex items-center justify-center shrink-0">
                    {initials}
                  </div>

                  <div>
                    <p className="text-sm font-bold text-[#0F172A]">{review.name}</p>
                    <p className="text-[11px] text-slate-400">{formatDate(review.created_at)}</p>
                    <div className="mt-1">
                      <StarRating value={review.rating} readonly size="sm" />
                    </div>
                  </div>
                </div>

                {/* Tombol hapus — hanya admin */}
                {isAdmin && (
                  <button
                    type="button"
                    onClick={() => handleDeleteClick(review.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors shrink-0"
                    title="Hapus ulasan"
                    aria-label="Hapus ulasan ini"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>

              <p className="mt-3 text-sm text-slate-700 leading-relaxed">{review.comment}</p>
            </div>
          );
        })}
      </div>

      {/* Load more */}
      {hasMore && (
        <button
          type="button"
          onClick={() => setVisible((v) => v + PAGE_SIZE)}
          className="mt-4 w-full py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"
        >
          Muat lebih banyak ({reviews.length - visible} ulasan lagi)
        </button>
      )}

      <ConfirmDialog
        isOpen={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleConfirmDelete}
        isLoading={isDeleting}
        title="Hapus Ulasan?"
        message="Ulasan ini akan dihapus secara permanen."
        confirmText="Ya, Hapus"
      />
    </>
  );
}

export default ReviewList;
