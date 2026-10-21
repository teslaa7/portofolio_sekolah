import React from 'react';
import { Link } from 'react-router-dom';
import {
  GraduationCap,
  Target,
  Rocket,
  CheckCircle2,
  Users2,
  Award,
  BookOpen,
  ArrowRight,
} from 'lucide-react';
import { Button } from '../../components/common/Button.jsx';

export function AboutPage() {
  const highlights = [
    {
      icon: Target,
      title: 'Dokumentasi Terpusat',
      desc: 'Menghindari hilangnya aset dan kode sumber siswa di flashdisk atau chat lokal melalui arsip digital terkurasi.',
    },
    {
      icon: Rocket,
      title: 'Etalase Mitra Industri',
      desc: 'Memudahkan dunia usaha dan dunia industri (DUDI) melihat bukti portofolio nyata siswa saat seleksi magang dan kerja.',
    },
    {
      icon: Award,
      title: 'Apresiasi & Motivasi Siswa',
      desc: 'Memberikan kebanggaan bagi siswa saat karya tugas akhir atau proyek praktikum mereka tampil resmi di publik.',
    },
    {
      icon: BookOpen,
      title: 'Refleksi Kurikulum Merdeka',
      desc: 'Mendukung pembelajaran berbasis proyek nyata (Project-Based Learning) yang terarah dan terukur.',
    },
  ];

  return (
    <div className="space-y-16 pb-20">
      {/* Hero Header */}
      <section className="bg-[#0B2E6B] text-white py-16 sm:py-24 px-4 sm:px-6 lg:px-8 border-b-4 border-[#F2B705]">
        <div className="max-w-4xl mx-auto text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-xs font-semibold text-[#F2B705]">
            <GraduationCap className="w-4 h-4" />
            <span>Pusat Unggulan Vokasi Indonesia</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold font-heading text-white">
            Tentang Website Portofolio Sekolah
          </h1>
          <p className="text-base sm:text-lg text-blue-100/90 leading-relaxed max-w-2xl mx-auto">
            Etalase digital terintegrasi yang menghadirkan pencapaian, inovasi teknologi, dan portofolio proyek karya siswa berstandar industri.
          </p>
        </div>
      </section>

      {/* Visi & Latar Belakang */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="space-y-5">
            <span className="text-xs font-bold uppercase tracking-wider text-[#0B2E6B] bg-blue-50 px-3 py-1 rounded-full">
              Latar Belakang
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-[#0F172A] font-heading">
              Menjembatani Talenta Muda dengan Dunia Nyata
            </h2>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
              Selama bertahun-tahun, ratusan proyek luar biasa yang dibangun siswa hanya tersimpan di komputer laboratorium sekolah atau flashdisk pribadi. Tanpa wadah pameran yang layak, calon mitra industri tidak dapat melihat potensi sejati yang dimiliki oleh siswa kami.
            </p>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
              Platform <strong>Portofolio Sekolah</strong> hadir sebagai gerbang utama bagi masyarakat, orang tua, perguruan tinggi, dan korporasi untuk menjelajahi solusi digital yang diciptakan siswa secara mandiri maupun kolaboratif.
            </p>
          </div>

          <div className="bg-white rounded-3xl p-8 border border-slate-200/80 shadow-md space-y-6">
            <h3 className="text-lg font-bold text-[#0F172A] font-heading flex items-center gap-2">
              <Users2 className="w-5 h-5 text-[#0B2E6B]" />
              <span>Komitmen Sekolah Kami</span>
            </h3>
            <ul className="space-y-3.5 text-sm text-slate-600">
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-[#16A34A] shrink-0 mt-0.5" />
                <span>Mendorong pembelajaran berbasis industri (Teaching Factory).</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-[#16A34A] shrink-0 mt-0.5" />
                <span>Menjamin keaslian dan kepemilikan kode sumber karya siswa.</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-[#16A34A] shrink-0 mt-0.5" />
                <span>Memberikan bimbingan langsung dari guru berlisensi kejuruan.</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-[#16A34A] shrink-0 mt-0.5" />
                <span>Memfasilitasi magang dan rekrutmen kerja cepat bagi lulusan.</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* 4 Pilar Tujuan */}
      <section className="bg-white py-16 border-y border-slate-200/80">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-[#0F172A] font-heading">
              Tujuan & Manfaat Utama
            </h2>
            <p className="text-sm text-slate-600 mt-2">
              Empat sasaran strategis dari peluncuran etalase portofolio digital ini.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {highlights.map((item, idx) => {
              const Icon = item.icon;
              return (
                <div
                  key={idx}
                  className="p-6 rounded-2xl bg-[#F5F8FF] border border-blue-100 flex items-start gap-4"
                >
                  <div className="w-12 h-12 rounded-xl bg-[#0B2E6B] text-[#F2B705] flex items-center justify-center shrink-0">
                    <Icon className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-[#0F172A] font-heading mb-1">
                      {item.title}
                    </h3>
                    <p className="text-sm text-slate-600 leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="max-w-4xl mx-auto px-4 text-center space-y-6">
        <h2 className="text-2xl sm:text-3xl font-bold text-[#0F172A] font-heading">
          Mulai Jelajahi Karya Unggulan Kami
        </h2>
        <p className="text-sm sm:text-base text-slate-600 max-w-xl mx-auto">
          Lihat berbagai kreasi aplikasi kasir, sistem presensi, toko online, dan website profil hasil karya anak bangsa.
        </p>
        <div>
          <Link to="/portofolio">
            <Button variant="primary" size="lg" icon={ArrowRight} iconPosition="right">
              Buka Galeri Portofolio
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}

export default AboutPage;
