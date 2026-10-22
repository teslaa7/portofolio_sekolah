import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Code2,
  Cpu,
  Palette,
  Calculator,
  Sparkles,
  Award,
  Layers,
  Users,
  Compass,
  MessageSquare,
} from 'lucide-react';
import { portfolioService } from '../../services/portfolioService.js';
import { categoryService } from '../../services/categoryService.js';
import { reviewService } from '../../services/reviewService.js';
import { PortfolioGrid } from '../../components/portfolio/PortfolioGrid.jsx';
import { Button } from '../../components/common/Button.jsx';
import { StarRating } from '../../components/reviews/StarRating.jsx';
import { LoadingSpinner } from '../../components/common/LoadingSkeleton.jsx';
import { formatDate } from '../../utils/formatDate.js';

export function HomePage() {
  const [featuredPortfolios, setFeaturedPortfolios] = useState([]);
  const [latestPortfolios, setLatestPortfolios] = useState([]);
  const [categories, setCategories] = useState([]);
  const [latestReviews, setLatestReviews] = useState([]);
  const [portfolioMap, setPortfolioMap] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadHomeData = async () => {
      try {
        setLoading(true);
        const catRes = await categoryService.getCategories();
        setCategories(catRes.data || []);

        const featRes = await portfolioService.getPortfolios({ status: 'published', is_featured: true, limit: 3 });
        setFeaturedPortfolios(featRes.data || []);

        const latestRes = await portfolioService.getPortfolios({ status: 'published', limit: 6, sortBy: 'latest' });
        const allLatest = latestRes.data || [];
        setLatestPortfolios(allLatest);

        // Build portfolio lookup map for review section
        const allPortRes = await portfolioService.getPortfolios({ status: 'published', limit: 100 });
        const pMap = {};
        (allPortRes.data || []).forEach((p) => { pMap[p.id] = p; });
        setPortfolioMap(pMap);

        const reviewRes = await reviewService.getLatestReviews(4);
        setLatestReviews(reviewRes.data || []);
      } catch (err) {
        console.error('Error loading home data:', err);
      } finally {
        setLoading(false);
      }
    };
    loadHomeData();
  }, []);

  const stats = [
    { label: 'Karya Digital Dihasilkan', value: '45+', icon: Code2 },
    { label: 'Jurusan Kejuruan Aktif', value: '4', icon: Layers },
    { label: 'Tahun Angkatan Siswa', value: '3+', icon: Compass },
    { label: 'Siswa & Tim Terlibat', value: '80+', icon: Users },
  ];

  const majors = [
    {
      name: 'Rekayasa Perangkat Lunak',
      code: 'RPL',
      desc: 'Pengembangan web app modern, sistem informasi manajemen, database relasional, dan mobile PWA.',
      icon: Code2,
      color: 'bg-blue-600',
    },
    {
      name: 'Teknik Komputer & Jaringan',
      code: 'TKJ',
      desc: 'Administrasi infrastruktur server, otomasi jaringan MikroTik/Cisco, dan monitoring sistem lab.',
      icon: Cpu,
      color: 'bg-emerald-600',
    },
    {
      name: 'Multimedia & DKV',
      code: 'DKV',
      desc: 'UI/UX design figma, animasi interaktif, company profile kreatif, dan branding visual digital.',
      icon: Palette,
      color: 'bg-purple-600',
    },
    {
      name: 'Akuntansi & Keuangan',
      code: 'AKL',
      desc: 'Digitalisasi pembukuan UKM, spreadsheet otomatisasi keuangan, dan audit laporan kas digital.',
      icon: Calculator,
      color: 'bg-amber-600',
    },
  ];

  return (
    <div className="space-y-16 sm:space-y-24 pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#0B2E6B] via-[#0D3882] to-[#0B2E6B] text-white pt-16 pb-24 lg:pt-24 lg:pb-32 px-4 sm:px-6 lg:px-8">
        {/* Subtle decorative glow */}
        <div className="absolute top-0 right-1/4 -mt-20 w-96 h-96 bg-[#F2B705]/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-10 -mb-20 w-80 h-80 bg-blue-400/20 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="max-w-3xl space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs sm:text-sm font-medium text-[#F2B705]">
              <Sparkles className="w-4 h-4 text-[#F2B705]" />
              <span>Etalase Resmi Karya Siswa SMK Unggulan</span>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight font-heading leading-tight text-white">
              Karya Nyata Siswa, Inovasi Digital untuk Masa Depan.
            </h1>

            <p className="text-base sm:text-xl text-blue-100/90 leading-relaxed font-normal max-w-2xl">
              Jelajahi berbagai proyek website, aplikasi manajemen, dan solusi digital yang dibangun dengan dedikasi tinggi oleh generasi muda calon profesional industri.
            </p>

            <div className="pt-4 flex flex-wrap items-center gap-4">
              <Link to="/portofolio">
                <Button variant="accent" size="lg" icon={ArrowRight} iconPosition="right">
                  Lihat Semua Portofolio
                </Button>
              </Link>

              <Link to="/tentang">
                <Button
                  variant="outline"
                  size="lg"
                  className="bg-white/10 text-white border-white/30 hover:bg-white/20 hover:text-white"
                >
                  Tentang Program Kami
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Counter Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-12 sm:-mt-16 relative z-20">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 bg-white rounded-2xl p-6 sm:p-8 shadow-xl border border-slate-100">
          {stats.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div key={idx} className="flex items-center gap-4 p-2 sm:p-3">
                <div className="w-12 h-12 rounded-xl bg-blue-50 text-[#0B2E6B] flex items-center justify-center shrink-0">
                  <Icon className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] font-heading">
                    {item.value}
                  </div>
                  <div className="text-xs sm:text-sm text-slate-500 font-medium">
                    {item.label}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Karya Unggulan (Featured) Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8 sm:mb-12">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#F2B705] bg-amber-50 px-3 py-1 rounded-full mb-2">
              <Award className="w-3.5 h-3.5 text-amber-600" />
              <span>Karya Pilihan Guru & Kurator</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-[#0F172A] font-heading">
              Karya Unggulan Siswa
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Proyek dengan arsitektur terbaik dan dampak nyata yang telah digunakan oleh mitra sekolah.
            </p>
          </div>

          <Link to="/portofolio">
            <Button variant="outline" size="sm" icon={ArrowRight} iconPosition="right">
              Semua Karya
            </Button>
          </Link>
        </div>

        {loading ? (
          <LoadingSpinner text="Memuat karya unggulan..." />
        ) : (
          <PortfolioGrid
            portfolios={featuredPortfolios}
            categories={categories}
            emptyTitle="Belum ada karya unggulan"
            emptyDescription="Guru belum menandai portofolio sebagai unggulan."
          />
        )}
      </section>

      {/* Program Keahlian / Jurusan */}
      <section className="bg-white py-16 border-y border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-[#0F172A] font-heading">
              Program Keahlian Vokasi
            </h2>
            <p className="text-sm text-slate-600 mt-2">
              Setiap jurusan dibimbing langsung oleh instruktur berpengalaman dengan kurikulum link and match industri.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {majors.map((m, idx) => {
              const Icon = m.icon;
              return (
                <div
                  key={idx}
                  className="rounded-2xl border border-slate-200/80 p-6 bg-[#F5F8FF]/60 hover:bg-white hover:shadow-lg transition-all duration-300 flex flex-col justify-between"
                >
                  <div>
                    <div
                      className={`w-12 h-12 rounded-xl text-white flex items-center justify-center mb-4 ${m.color}`}
                    >
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      Jurusan {m.code}
                    </span>
                    <h3 className="text-base font-bold text-[#0F172A] mt-1 mb-2 font-heading">
                      {m.name}
                    </h3>
                    <p className="text-xs text-slate-600 leading-relaxed">{m.desc}</p>
                  </div>
                  <div className="mt-6 pt-4 border-t border-slate-200/60">
                    <Link
                      to={`/portofolio?major=${encodeURIComponent(m.name)}`}
                      className="text-xs font-semibold text-[#0B2E6B] hover:text-[#1E40AF] inline-flex items-center gap-1"
                    >
                      <span>Lihat Karya {m.code}</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Karya Terbaru Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8 sm:mb-12">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-[#0F172A] font-heading">
              Karya Terbaru
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Daftar proyek siswa yang baru saja dirilis dan disetujui kurasi guru.
            </p>
          </div>

          <Link to="/portofolio">
            <Button variant="primary" size="sm" icon={ArrowRight} iconPosition="right">
              Jelajahi Semua Portofolio
            </Button>
          </Link>
        </div>

        {loading ? (
          <LoadingSpinner text="Memuat karya terbaru..." />
        ) : (
          <PortfolioGrid portfolios={latestPortfolios} categories={categories} />
        )}
      </section>

      {/* Ulasan Terbaru */}
      {latestReviews.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#0B2E6B] bg-blue-50 px-3 py-1 rounded-full mb-2">
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Suara Pengunjung</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-[#0F172A] font-heading">
                Ulasan Terbaru
              </h2>
              <p className="text-sm text-slate-500 mt-1">
                Apa kata pengunjung tentang karya-karya terbaik siswa kami.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {latestReviews.map((review) => {
              const portfolio = portfolioMap[review.portfolio_id];
              const initials = review.name
                .split(' ')
                .slice(0, 2)
                .map((w) => w[0]?.toUpperCase() || '')
                .join('');
              return (
                <div
                  key={review.id}
                  className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex flex-col gap-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-[#0B2E6B] text-white text-sm font-bold flex items-center justify-center shrink-0">
                      {initials}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-[#0F172A] truncate">{review.name}</p>
                      <StarRating value={review.rating} readonly size="sm" />
                    </div>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed line-clamp-3">
                    "{review.comment}"
                  </p>
                  {portfolio && (
                    <Link
                      to={`/portofolio/${portfolio.slug}`}
                      className="mt-auto text-xs font-semibold text-[#0B2E6B] hover:text-[#1E40AF] truncate"
                    >
                      → {portfolio.title}
                    </Link>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* CTA Kolaborasi Industri */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-[#0B2E6B] to-[#1E40AF] rounded-3xl p-8 sm:p-14 text-white flex flex-col lg:flex-row items-center justify-between gap-8 shadow-xl">
          <div className="max-w-2xl space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-[#F2B705]">
              Kemitraan Industri & Magang
            </span>
            <h3 className="text-2xl sm:text-4xl font-extrabold font-heading text-white">
              Tertarik Merekrut atau Berkolaborasi dengan Siswa Kami?
            </h3>
            <p className="text-sm sm:text-base text-blue-100/90 leading-relaxed">
              Kami membuka peluang magang, penyaluran kerja, dan pembuatan proyek kerja sama dengan perusahaan dan instansi pemerintah.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto shrink-0">
            <Link to="/tentang">
              <Button variant="accent" size="lg" className="w-full sm:w-auto">
                Pelajari Info Sekolah
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

export default HomePage;
