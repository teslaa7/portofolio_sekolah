import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FolderGit2,
  CheckCircle2,
  Clock,
  Star,
  Plus,
  ArrowRight,
  ExternalLink,
  Edit,
  Eye,
  BarChart3,
  Tags,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell,
} from 'recharts';
import { dashboardService } from '../../services/dashboardService.js';
import { StatCard } from '../../components/common/StatCard.jsx';
import { StatusBadge } from '../../components/common/StatusBadge.jsx';
import { Button } from '../../components/common/Button.jsx';
import { LoadingSpinner } from '../../components/common/LoadingSkeleton.jsx';
import { formatShortDate } from '../../utils/formatDate.js';

export function DashboardPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        setLoading(true);
        const res = await dashboardService.getSummary();
        if (res.success) {
          setData(res.data);
        }
      } catch (err) {
        console.error('Error loading dashboard:', err);
      } finally {
        setLoading(false);
      }
    };
    loadDashboard();
  }, []);

  if (loading || !data) {
    return <LoadingSpinner text="Memuat data dashboard statistik..." />;
  }

  const { summary, majorChartData, latestPortfolios } = data;

  const barColors = ['#0B2E6B', '#10B981', '#8B5CF6', '#F59E0B'];

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-[#0B2E6B] to-[#1E40AF] rounded-3xl p-6 sm:p-8 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-lg">
        <div className="space-y-1.5">
          <span className="text-xs font-semibold text-[#F2B705] uppercase tracking-wider">
            Selamat Datang di Panel Guru
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold font-heading text-white">
            Kelola Karya Siswa Lebih Cepat & Terstruktur
          </h2>
          <p className="text-xs sm:text-sm text-blue-100/90 max-w-xl">
            Pantau statistik publikasi karya siswa, tinjau draft kiriman terbaru, dan tandai karya terbaik sebagai unggulan sekolah.
          </p>
        </div>

        <Link to="/admin/portofolio/tambah" className="shrink-0">
          <Button variant="accent" size="md" icon={Plus}>
            Tambah Karya Baru
          </Button>
        </Link>
      </div>

      {/* 4 Summary Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <StatCard
          title="Total Karya"
          value={summary.total}
          icon={FolderGit2}
          badgeColor="blue"
          badgeText="Semua data"
          description="Seluruh proyek tersimpan"
        />

        <StatCard
          title="Karya Dipublikasi"
          value={summary.published}
          icon={CheckCircle2}
          badgeColor="emerald"
          badgeText="Tampil Publik"
          description="Dapat diakses umum"
        />

        <StatCard
          title="Karya Draft"
          value={summary.draft}
          icon={Clock}
          badgeColor="amber"
          badgeText="Perlu Ditinjau"
          description="Hanya terlihat di admin"
        />

        <StatCard
          title="Karya Unggulan"
          value={summary.featured}
          icon={Star}
          badgeColor="indigo"
          badgeText="Highlight"
          description="Di beranda utama"
        />
      </div>

      {/* Chart Section */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
          <div>
            <h3 className="text-lg font-bold text-[#0F172A] font-heading flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-[#0B2E6B]" />
              <span>Distribusi Karya per Jurusan Kejuruan</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Grafik perbandingan jumlah proyek yang telah diselesaikan oleh setiap kompetensi keahlian.
            </p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 self-start sm:self-auto">
            {summary.categoriesCount} Kategori Terdaftar
          </span>
        </div>

        <div className="h-72 w-full pt-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={majorChartData}
              margin={{ top: 10, right: 10, left: -20, bottom: 20 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
              <XAxis
                dataKey="name"
                tick={{ fill: '#475569', fontSize: 12, fontWeight: 600 }}
                tickLine={false}
                axisLine={{ stroke: '#CBD5E1' }}
              />
              <YAxis
                allowDecimals={false}
                tick={{ fill: '#64748B', fontSize: 12 }}
                tickLine={false}
                axisLine={{ stroke: '#CBD5E1' }}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const item = payload[0].payload;
                    return (
                      <div className="bg-slate-900 text-white text-xs rounded-xl p-3 shadow-xl">
                        <p className="font-bold text-sm text-[#F2B705]">{item.fullName}</p>
                        <p className="mt-1">
                          Jumlah Karya: <span className="font-bold text-white">{item.total} proyek</span>
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar dataKey="total" radius={[8, 8, 0, 0]}>
                {majorChartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={barColors[index % barColors.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 5 Karya Terbaru Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-[#0F172A] font-heading">
              5 Karya Terbaru Ditambahkan
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Daftar proyek paling mutakhir yang masuk ke dalam sistem.
            </p>
          </div>
          <Link to="/admin/portofolio">
            <Button variant="ghost" size="sm" icon={ArrowRight} iconPosition="right">
              Kelola Semua
            </Button>
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-700">
            <thead className="bg-[#F5F8FF] text-xs uppercase font-semibold text-slate-500 border-b border-slate-200">
              <tr>
                <th className="py-3.5 px-6">Karya</th>
                <th className="py-3.5 px-6">Siswa & Kelas</th>
                <th className="py-3.5 px-6">Jurusan</th>
                <th className="py-3.5 px-6">Status</th>
                <th className="py-3.5 px-6">Tanggal</th>
                <th className="py-3.5 px-6 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {latestPortfolios.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <img
                        src={item.thumbnail_url}
                        alt={item.title}
                        className="w-12 h-10 rounded-lg object-cover border border-slate-200 shrink-0"
                      />
                      <div className="max-w-xs">
                        <Link
                          to={`/portofolio/${item.slug}`}
                          target="_blank"
                          className="font-bold text-[#0F172A] hover:text-[#0B2E6B] transition-colors truncate block"
                        >
                          {item.title}
                        </Link>
                        {item.is_featured && (
                          <span className="inline-flex items-center gap-1 text-[10px] text-amber-700 font-semibold mt-0.5">
                            <Star className="w-3 h-3 fill-amber-400 text-amber-500" />
                            Unggulan
                          </span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <p className="font-semibold text-slate-800 text-xs">{item.student_name}</p>
                    <p className="text-[11px] text-slate-400">{item.class_name}</p>
                  </td>
                  <td className="py-4 px-6">
                    <span className="text-xs text-slate-600 truncate block max-w-[150px]">
                      {item.major}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <StatusBadge status={item.status} />
                  </td>
                  <td className="py-4 px-6 text-xs text-slate-500">
                    {formatShortDate(item.created_at)}
                  </td>
                  <td className="py-4 px-6 text-right space-x-1 whitespace-nowrap">
                    <Link
                      to={`/portofolio/${item.slug}`}
                      target="_blank"
                      className="p-1.5 text-slate-400 hover:text-blue-600 rounded-lg hover:bg-blue-50 inline-block transition-colors"
                      title="Lihat Pratinjau Publik"
                    >
                      <Eye className="w-4 h-4" />
                    </Link>
                    <Link
                      to={`/admin/portofolio/${item.id}/edit`}
                      className="p-1.5 text-slate-400 hover:text-emerald-600 rounded-lg hover:bg-emerald-50 inline-block transition-colors"
                      title="Edit Karya"
                    >
                      <Edit className="w-4 h-4" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default DashboardPage;
