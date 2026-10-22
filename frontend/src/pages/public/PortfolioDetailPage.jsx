import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  ExternalLink,
  Github,
  Calendar,
  User,
  GraduationCap,
  Layers,
  Star,
  CheckCircle2,
  Share2,
  MessageSquare,
} from 'lucide-react';
import { portfolioService } from '../../services/portfolioService.js';
import { categoryService } from '../../services/categoryService.js';
import { reviewService } from '../../services/reviewService.js';
import { Button } from '../../components/common/Button.jsx';
import { PortfolioGrid } from '../../components/portfolio/PortfolioGrid.jsx';
import { LoadingSpinner } from '../../components/common/LoadingSkeleton.jsx';
import { ErrorState } from '../../components/common/ErrorState.jsx';
import { RatingSummary } from '../../components/reviews/RatingSummary.jsx';
import { ReviewForm } from '../../components/reviews/ReviewForm.jsx';
import { ReviewList } from '../../components/reviews/ReviewList.jsx';
import { formatDate } from '../../utils/formatDate.js';
import { useToast } from '../../hooks/useToast.jsx';
import { useAuth } from '../../hooks/useAuth.jsx';

export function PortfolioDetailPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const { user } = useAuth();

  const [portfolio, setPortfolio] = useState(null);
  const [categories, setCategories] = useState([]);
  const [categoryName, setCategoryName] = useState('');
  const [relatedPortfolios, setRelatedPortfolios] = useState([]);
  const [activeImage, setActiveImage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Review state
  const [ratingSummary, setRatingSummary] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadReviews = useCallback(async (portfolioId) => {
    const [summaryRes, listRes] = await Promise.all([
      reviewService.getRatingSummary(portfolioId),
      reviewService.getReviews(portfolioId, { limit: 100 }),
    ]);
    if (summaryRes.success) setRatingSummary(summaryRes.data);
    if (listRes.success) setReviews(listRes.data || []);
  }, []);

  useEffect(() => {
    const loadDetail = async () => {
      setLoading(true);
      setError(null);
      try {
        const catRes = await categoryService.getCategories();
        const cats = catRes.data || [];
        setCategories(cats);

        const res = await portfolioService.getPortfolioBySlug(slug);
        if (!res.success || !res.data) {
          setError('Portofolio tidak ditemukan');
          return;
        }

        const data = res.data;
        setPortfolio(data);
        setActiveImage(data.thumbnail_url);

        const cat = cats.find((c) => Number(c.id) === Number(data.category_id));
        setCategoryName(cat ? cat.name : 'Proyek Siswa');

        // Load related portfolios
        const relRes = await portfolioService.getRelatedPortfolios(data.id, data.category_id, 3);
        setRelatedPortfolios(relRes.data || []);

        // Load reviews
        await loadReviews(data.id);
      } catch (err) {
        setError(err.message || 'Terjadi kesalahan saat memuat portofolio');
      } finally {
        setLoading(false);
      }
    };

    loadDetail();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [slug]);

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({ title: portfolio?.title, url: window.location.href });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Tautan portofolio berhasil disalin!');
    }
  };

  const handleSubmitReview = async (payload) => {
    if (!portfolio) return;
    const res = await reviewService.addReview(portfolio.id, payload);
    if (res.success) {
      toast.success(res.message);
      await loadReviews(portfolio.id);
    } else {
      toast.error(res.message || 'Gagal mengirim ulasan.');
    }
  };

  const handleDeleteReview = async (reviewId) => {
    setIsDeleting(true);
    const res = await reviewService.deleteReview(reviewId, user);
    if (res.success) {
      toast.success('Ulasan berhasil dihapus.');
      await loadReviews(portfolio.id);
    } else {
      toast.error(res.message);
    }
    setIsDeleting(false);
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-20">
        <LoadingSpinner text="Memuat detail karya siswa..." />
      </div>
    );
  }

  if (error || !portfolio) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16">
        <ErrorState
          title="Karya Tidak Ditemukan"
          message={error || 'Karya yang Anda cari mungkin telah dihapus atau URL tidak valid.'}
          onRetry={() => navigate('/portofolio')}
        />
        <div className="mt-6 text-center">
          <Link to="/portofolio">
            <Button variant="outline" icon={ArrowLeft}>
              Kembali ke Galeri
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const allScreenshots = [
    portfolio.thumbnail_url,
    ...(portfolio.screenshots || []),
  ].filter(Boolean);

  return (
    <div className="pb-20 pt-6">
      {/* Top Breadcrumb & Nav */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-6">
        <div className="flex items-center justify-between">
          <Link
            to="/portofolio"
            className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-[#0B2E6B] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Kembali ke Semua Portofolio</span>
          </Link>

          <Button variant="outline" size="sm" icon={Share2} onClick={handleShare}>
            Bagikan Karya
          </Button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Main Header & Image Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Media Showcase */}
          <div className="lg:col-span-7 space-y-4">
            {/* Active Big Image */}
            <div className="relative aspect-video w-full rounded-2xl overflow-hidden border border-slate-200/90 shadow-md bg-slate-900 flex items-center justify-center">
              <img
                src={activeImage || portfolio.thumbnail_url}
                alt={portfolio.title}
                className="w-full h-full object-cover transition-all duration-300"
              />
              {portfolio.is_featured && (
                <div className="absolute top-4 left-4">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-[#F2B705] text-[#0B2E6B] shadow-md">
                    <Star className="w-4 h-4 fill-[#0B2E6B]" />
                    Karya Unggulan
                  </span>
                </div>
              )}
            </div>

            {/* Thumbnail list */}
            {allScreenshots.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2">
                {allScreenshots.map((imgUrl, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActiveImage(imgUrl)}
                    className={`relative w-24 h-16 rounded-xl overflow-hidden border-2 shrink-0 transition-all ${
                      activeImage === imgUrl
                        ? 'border-[#0B2E6B] ring-2 ring-blue-200 scale-102'
                        : 'border-slate-200 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={imgUrl} alt="Thumbnail" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Key Info & CTA */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-6">
              {/* Category & Year */}
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-3 py-1 rounded-lg text-xs font-bold bg-blue-50 text-[#0B2E6B] border border-blue-100">
                  {categoryName}
                </span>
                <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-100 text-slate-700">
                  Tahun {portfolio.year}
                </span>
              </div>

              {/* Title */}
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] font-heading leading-tight">
                {portfolio.title}
              </h1>

              {/* Short summary */}
              <p className="text-sm text-slate-600 leading-relaxed font-normal">
                {portfolio.short_description}
              </p>

              {/* Student Metadata Box */}
              <div className="p-4 rounded-xl bg-[#F5F8FF] border border-blue-100/80 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-100 text-[#0B2E6B] flex items-center justify-center shrink-0">
                    <User className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[11px] uppercase font-semibold text-slate-400 block">
                      Pembuat Karya
                    </span>
                    <span className="text-sm font-bold text-slate-800">
                      {portfolio.student_name}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-blue-200/60 text-xs">
                  <div>
                    <span className="text-slate-500 block">Kelas:</span>
                    <span className="font-semibold text-slate-800">{portfolio.class_name}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Jurusan:</span>
                    <span className="font-semibold text-slate-800 truncate block">
                      {portfolio.major}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3 pt-2">
                {portfolio.project_url && (
                  <a
                    href={portfolio.project_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block"
                  >
                    <Button
                      variant="primary"
                      size="lg"
                      className="w-full"
                      icon={ExternalLink}
                      iconPosition="right"
                    >
                      Kunjungi Website Demo
                    </Button>
                  </a>
                )}

                {portfolio.repo_url && (
                  <a
                    href={portfolio.repo_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block"
                  >
                    <Button
                      variant="outline"
                      size="md"
                      className="w-full"
                      icon={Github}
                      iconPosition="left"
                    >
                      Lihat Repository GitHub
                    </Button>
                  </a>
                )}
              </div>

              <div className="text-[11px] text-slate-400 text-center">
                Diterbitkan pada {formatDate(portfolio.created_at)}
              </div>
            </div>
          </div>
        </div>

        {/* Tech Stack & Detailed Description */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-6">
            <h2 className="text-xl font-bold text-[#0F172A] font-heading border-b border-slate-100 pb-3">
              Tentang Proyek Ini
            </h2>
            <div className="prose prose-slate max-w-none text-slate-700 text-sm sm:text-base leading-relaxed whitespace-pre-line">
              {portfolio.description}
            </div>
          </div>

          <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-6">
            <h3 className="text-base font-bold text-[#0F172A] font-heading border-b border-slate-100 pb-3">
              Teknologi yang Digunakan
            </h3>
            <div className="flex flex-wrap gap-2">
              {portfolio.tech_stack?.map((tech, i) => (
                <span
                  key={i}
                  className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-blue-50 text-[#0B2E6B] border border-blue-200"
                >
                  {tech}
                </span>
              ))}
            </div>

            <div className="pt-4 border-t border-slate-100">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                Status Verifikasi
              </h4>
              <div className="flex items-center gap-2 text-xs text-emerald-700 font-medium bg-emerald-50 p-3 rounded-xl border border-emerald-200">
                <CheckCircle2 className="w-4 h-4 text-[#16A34A] shrink-0" />
                <span>Karya ini telah diverifikasi oleh Guru Pembimbing Vokasi</span>
              </div>
            </div>
          </div>
        </div>

        {/* Rating & Ulasan */}
        <section className="pt-4" id="ulasan">
          <div className="mb-6 flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-[#0B2E6B]" />
            <h3 className="text-2xl font-bold text-[#0F172A] font-heading">Rating &amp; Ulasan</h3>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-5">
              {ratingSummary && <RatingSummary summary={ratingSummary} />}
            </div>
            <div className="lg:col-span-7">
              <ReviewForm onSubmit={handleSubmitReview} currentUser={user ?? null} />
            </div>
          </div>

          <div className="mt-6">
            <ReviewList
              reviews={reviews}
              currentUser={user ?? null}
              onDelete={handleDeleteReview}
              isDeleting={isDeleting}
            />
          </div>
        </section>

        {/* Related Portfolios Section */}
        {relatedPortfolios.length > 0 && (
          <section className="pt-8">
            <div className="mb-6">
              <h3 className="text-2xl font-bold text-[#0F172A] font-heading">
                Karya Terkait Lainnya
              </h3>
              <p className="text-xs sm:text-sm text-slate-500">
                Karya sejenis dalam kategori yang sama atau buatan siswa berbakat lainnya.
              </p>
            </div>
            <PortfolioGrid portfolios={relatedPortfolios} categories={categories} />
          </section>
        )}
      </div>
    </div>
  );
}

export default PortfolioDetailPage;
