import React from 'react';
import { Link } from 'react-router-dom';
import { GraduationCap, Mail, Phone, MapPin, Heart } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-[#0B2E6B] text-white pt-16 pb-8 border-t-4 border-[#F2B705]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 pb-12 border-b border-blue-900/60">
          {/* Kolom 1: Profil */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white text-[#0B2E6B] flex items-center justify-center font-bold shadow-md">
                <GraduationCap className="w-6 h-6 text-[#0B2E6B]" />
              </div>
              <span className="font-heading font-extrabold text-xl text-white tracking-tight">
                Portofolio<span className="text-[#F2B705]">Sekolah</span>
              </span>
            </div>
            <p className="text-sm text-blue-100/80 leading-relaxed">
              Wadah etalase resmi karya digital inovatif siswa SMK. Menampilkan proyek nyata berbasis industri dari jurusan RPL, TKJ, Multimedia, dan Akuntansi.
            </p>
          </div>

          {/* Kolom 2: Navigasi Cepat */}
          <div>
            <h4 className="font-heading font-semibold text-base text-[#F2B705] mb-4">Navigasi Cepat</h4>
            <ul className="space-y-2.5 text-sm text-blue-100/80">
              <li>
                <Link to="/" className="hover:text-white transition-colors">
                  Beranda
                </Link>
              </li>
              <li>
                <Link to="/portofolio" className="hover:text-white transition-colors">
                  Galeri Portofolio
                </Link>
              </li>
              <li>
                <Link to="/tentang" className="hover:text-white transition-colors">
                  Tentang Program
                </Link>
              </li>
              <li>
                <Link to="/login" className="hover:text-white transition-colors">
                  Akses Guru / Admin
                </Link>
              </li>
            </ul>
          </div>

          {/* Kolom 3: Jurusan Vokasi */}
          <div>
            <h4 className="font-heading font-semibold text-base text-[#F2B705] mb-4">Jurusan Vokasi</h4>
            <ul className="space-y-2.5 text-sm text-blue-100/80">
              <li>Rekayasa Perangkat Lunak (RPL)</li>
              <li>Teknik Komputer & Jaringan (TKJ)</li>
              <li>Desain Komunikasi Visual / Multimedia</li>
              <li>Akuntansi & Keuangan Lembaga</li>
            </ul>
          </div>

          {/* Kolom 4: Kontak Sekolah */}
          <div>
            <h4 className="font-heading font-semibold text-base text-[#F2B705] mb-4">Sekretariat</h4>
            <ul className="space-y-3 text-sm text-blue-100/80">
              <li className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-[#F2B705] shrink-0 mt-0.5" />
                <span>Jl. Pendidikan Vokasi No. 45, Indonesia</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-[#F2B705] shrink-0" />
                <span>(021) 8876-5432</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-[#F2B705] shrink-0" />
                <span>portofolio@sekolah.sch.id</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-blue-200/70">
          <p>© {new Date().getFullYear()} Portofolio Sekolah. Seluruh hak cipta dilindungi undang-undang.</p>
          <p className="flex items-center gap-1">
            Dibangun dengan bangga untuk talenta muda Indonesia
          </p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
