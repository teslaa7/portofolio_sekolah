import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { MessageSquare, Star, BarChart2 } from 'lucide-react';
import { reviewService } from '../../services/reviewService.js';
import { StarRating } from '../../components/reviews/StarRating.jsx';
import { EmptyState } from '../../components/common/EmptyState.jsx';
import { Pagination } from '../../components/common/Pagination.jsx';
import { LoadingSpinner, SkeletonTableRows } from '../../components/common/LoadingSkeleton.jsx';
import { ErrorState } from '../../components/common/ErrorState.jsx';
import { formatDate } from '../../utils/formatDate.js';

const LIMIT = 10;

/** Satu baris ulasan, dipakai di kedua tab. */
function ReviewItem({ review, showOwner = false }) {
  const initials = (review.name || 'T')
    .split(' ').slice(0, 2)
    .map((w) => w[0]?.toUpperCase() || '')
    .join('');

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-3">
      <div className="flex items-start gap-3">
        {/* Thumbnail karya kecil */}
        {review.thumbnail_url && (
          <img
            src={review.thumbnail_url}
            alt={review.portfolio_title}
            className="w-14 h-10 rounded-lg object-cover border border-slate-200 shrink-0"
            onError={(e) => { e.currentTarget.style.display = 'none'; }}
          />
        )}

        <div className="min-w-0 flex-1">
          {review.portfolio_title && (
            <Link
              to={`/portofolio/${review.portfolio_slug}`}
              target="_blank"
              className="text-xs font-semibold text-[#0B2E6B] hover:underline truncate block"
            >
              {review.portfolio_title}
            </Link>
          )}
          {showOwner && review.owner_name && (
            <p className="text-[11px] text-slate-400">oleh {review.owner_name}</p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Avatar inisial reviewer */}
        <div className="w-9 h-9 rounded-full bg-[#0B2E6B] text-white text-sm font-bold flex items-center justify-center shrink-0">
          {initials}
        </div>
        <div>
          <p className="text-sm font-bold text-[#0F172A]">{review.name}</p>
          <p className="text-[11px] text-slate-400">{formatDate(review.created_at)}</p>
          <StarRating value={review.rating} readonly size="sm" />
        </div>
      </div>

      <p className="text-sm text-slate-700 leading-relaxed">{review.comment}</p>
    </div>
  );
}

/** Kartu ringkasan angka kecil. */
function SummaryCard({ label, value, icon: Icon, color = 'blue' }) {
  const colorMap = {
    blue:    'bg-blue-50 text-[#0B2E6B]',
    amber:   'bg-amber-50 text-amber-700',
    emerald: 'bg-emerald-50 text-emerald-700',
  };
  return (
    <div className={`rounded-2xl p-5 flex items-center gap-4 ${colorMap[color] || colorMap.blue} border border-current/10`}>
      <div className="w-10 h-10 rounded-xl bg-white/60 flex items-center justify-center shrink-0">
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <p className="text-2xl font-extrabold font-heading leading-none">{value}</p>
        <p className="text-xs font-medium mt-0.5 opacity-80">{label}</p>
      </div>
    </div>
  );
}

export function StudentReviewsPage() {
  const [activeTab, setActiveTab] = useState('mine');

  // Tab "Ulasan di Karya Saya"
  const [myReviews, setMyReviews]       = useState([]);
  const [myMeta, setMyMeta]             = useState({ page: 1, limit: LIMIT, total: 0, totalPages: 1 });
  const [mySummary, setMySummary]       = useState(null);
  const [myPage, setMyPage]             = useState(1);
  const [myLoading, setMyLoading]       = useState(true);
  const [myError, setMyError]           = useState(null);

  // Tab "Ulasan Karya Murid Lain"
  const [comReviews, setComReviews]     = useState([]);
  const [comMeta, setComMeta]           = useState({ page: 1, limit: LIMIT, total: 0, totalPages: 1 });
  const [comPage, setComPage]           = useState(1);
  const [comLoading, setComLoading]     = useState(false);
  const [comError, setComError]         = useState(null);
  const [comLoaded, setComLoaded]       = useState(false);

  // Load ulasan karya sendiri
  const loadMyReviews = useCallback(async () => {
    setMyLoading(true);
    setMyError(null);
    try {
      const res = await reviewService.getMyReviews({ page: myPage, limit: LIMIT });
      if (res.success) {
        setMyReviews(res.data || []);
        setMyMeta(res.meta || myMeta);
        setMySummary(res.meta?.summary || null);
      } else {
        setMyError(res.message || 'Gagal memuat ulasan.');
      }
    } catch {
      setMyError('Terjadi kesalahan jaringan.');
    } finally {
      setMyLoading(false);
    }
  }, [myPage]);

  useEffect(() => { loadMyReviews(); }, [loadMyReviews]);

  // Load ulasan komunitas (lazy: hanya saat tab pertama dibuka)
  const loadCommunity = useCallback(async () => {
    setComLoading(true);
    setComError(null);
    try {
      const res = await reviewService.getCommunityReviews({ page: comPage, limit: LIMIT });
      if (res.success) {
        setComReviews(res.data || []);
        setComMeta(res.meta || comMeta);
      } else {
        setComError(res.message || 'Gagal memuat ulasan komunitas.');
      }
    } catch {
      setComError('Terjadi kesalahan jaringan.');
    } finally {
      setComLoading(false);
      setComLoaded(true);
    }
  }, [comPage]);

  useEffect(() => {
    if (activeTab === 'community' && !comLoaded) loadCommunity();
  }, [activeTab, comLoaded, loadCommunity]);

  useEffect(() => {
    if (activeTab === 'community' && comLoaded) loadCommunity();
  }, [comPage]);

  const tabs = [
    { id: 'mine',      label: 'Ulasan di Karya Saya' },
    { id: 'community', label: 'Ulasan Karya Murid Lain' },
  ];

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="flex gap-1 bg-slate-100 p-1 rounded-xl w-fit">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? 'bg-white text-[#0B2E6B] shadow-xs font-semibold'
                : 'text-slate-600 hover:text-[#0B2E6B]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── Tab: Ulasan di Karya Saya ─────────────────────────────────────── */}
      {activeTab === 'mine' && (
        <div className="space-y-5">
          {/* Kartu ringkasan */}
          {mySummary && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <SummaryCard label="Total Ulasan" value={mySummary.total_reviews} icon={MessageSquare} color="blue" />
              <SummaryCard label="Rata-rata Rating" value={mySummary.avg_rating > 0 ? `${mySummary.avg_rating} ★` : '—'} icon={Star} color="amber" />
              <SummaryCard label="Jumlah Karya" value={mySummary.portfolio_count} icon={BarChart2} color="emerald" />
            </div>
          )}

          {myError && <ErrorState message={myError} onRetry={loadMyReviews} />}

          {myLoading ? (
            <LoadingSpinner text="Memuat ulasan karya Anda..." />
          ) : myReviews.length === 0 ? (
            <EmptyState
              title="Belum Ada Ulasan"
              description="Belum ada pengunjung yang memberikan ulasan pada karya-karya Anda."
            />
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {myReviews.map((r) => <ReviewItem key={r.id} review={r} />)}
              </div>
              {myMeta.totalPages > 1 && (
                <Pagination
                  currentPage={myMeta.page}
                  totalPages={myMeta.totalPages}
                  totalItems={myMeta.total}
                  itemsPerPage={myMeta.limit}
                  onPageChange={(p) => { setMyPage(p); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                />
              )}
            </>
          )}
        </div>
      )}

      {/* ── Tab: Ulasan Karya Murid Lain ──────────────────────────────────── */}
      {activeTab === 'community' && (
        <div className="space-y-5">
          <p className="text-sm text-slate-500">
            Ulasan dari pengunjung pada karya siswa lain — untuk inspirasi dan belajar.
          </p>

          {comError && <ErrorState message={comError} onRetry={loadCommunity} />}

          {comLoading ? (
            <LoadingSpinner text="Memuat ulasan komunitas..." />
          ) : comReviews.length === 0 && comLoaded ? (
            <EmptyState
              title="Belum Ada Ulasan Komunitas"
              description="Belum ada ulasan dari pengunjung pada karya murid lain."
            />
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {comReviews.map((r) => <ReviewItem key={r.id} review={r} showOwner />)}
              </div>
              {comMeta.totalPages > 1 && (
                <Pagination
                  currentPage={comMeta.page}
                  totalPages={comMeta.totalPages}
                  totalItems={comMeta.total}
                  itemsPerPage={comMeta.limit}
                  onPageChange={(p) => { setComPage(p); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                />
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default StudentReviewsPage;
