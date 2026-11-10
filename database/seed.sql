-- ============================================================
-- Portofolio Sekolah - seed.sql
-- Data awal untuk development & testing
--
-- PERINGATAN: File ini MENGOSONGKAN dan MENGISI ULANG tabel.
-- JANGAN jalankan di database production yang sudah berisi data asli!
-- Untuk production, gunakan schema.sql (hanya struktur).
--
-- Cara pakai: phpMyAdmin -> pilih database -> tab Import -> pilih file ini.
-- ============================================================

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- Bersihkan data lama (DELETE, bukan TRUNCATE, karena tabel dirujuk foreign key)
DELETE FROM reviews;
DELETE FROM portfolios;
DELETE FROM categories;
DELETE FROM majors;
DELETE FROM users;

ALTER TABLE reviews    AUTO_INCREMENT = 1;
ALTER TABLE portfolios AUTO_INCREMENT = 1;
ALTER TABLE categories AUTO_INCREMENT = 1;
ALTER TABLE majors     AUTO_INCREMENT = 1;
ALTER TABLE users      AUTO_INCREMENT = 1;

SET FOREIGN_KEY_CHECKS = 1;

-- ── Users ────────────────────────────────────────────────────────────────────
-- Admin: password admin123  (hash bcrypt cost 10)
-- Murid: password siswa123  (hash bcrypt cost 10)
INSERT INTO users (id, name, email, password, role, avatar, class_name, major, is_active) VALUES
(1, 'Admin Sekolah', 'admin@sekolah.sch.id', '$2a$10$Ez.Qn6GRxj971Q3AnPVXQeMRjxjJuQbt40zv89.haxmNzhhgRD5/.', 'admin',   NULL, '', '', 1),
(2, 'Ahmad Fauzi',   'ahmad@siswa.sch.id',   '$2a$10$1mKItZlZ1ib73sRJ2pzBxeyS.OEm/lsAq3z3XZ.fHKlZzTX/oHi/2', 'student', NULL, 'XII RPL 1',          'Rekayasa Perangkat Lunak (RPL)',            1),
(3, 'Siti Rahayu',   'siti@siswa.sch.id',    '$2a$10$1mKItZlZ1ib73sRJ2pzBxeyS.OEm/lsAq3z3XZ.fHKlZzTX/oHi/2', 'student', NULL, 'XI TKJ 2',           'Teknik Komputer & Jaringan (TKJ)',         1),
(4, 'Rani Dewi',     'rani@siswa.sch.id',    '$2a$10$1mKItZlZ1ib73sRJ2pzBxeyS.OEm/lsAq3z3XZ.fHKlZzTX/oHi/2', 'student', NULL, 'XII Multimedia 1',   'Desain Komunikasi Visual / Multimedia',    1);

-- ── Categories ───────────────────────────────────────────────────────────────
INSERT INTO categories (id, name, slug) VALUES
(1, 'Aplikasi Web',      'aplikasi-web'),
(2, 'Aplikasi Mobile',   'aplikasi-mobile'),
(3, 'Desain UI/UX',      'desain-ui-ux'),
(4, 'Jaringan',          'jaringan'),
(5, 'Multimedia',        'multimedia');

-- ── Majors ───────────────────────────────────────────────────────────────────
INSERT INTO majors (id, name, code, description) VALUES
(1, 'Rekayasa Perangkat Lunak (RPL)',         'RPL', 'Pengembangan web app modern, sistem informasi manajemen, database relasional, dan mobile PWA.'),
(2, 'Teknik Komputer & Jaringan (TKJ)',       'TKJ', 'Administrasi infrastruktur server, otomasi jaringan MikroTik/Cisco, dan monitoring sistem lab.'),
(3, 'Desain Komunikasi Visual / Multimedia',  'DKV', 'UI/UX design figma, animasi interaktif, company profile kreatif, dan branding visual digital.'),
(4, 'Akuntansi & Keuangan Lembaga',           'AKL', 'Digitalisasi pembukuan UKM, spreadsheet otomatisasi keuangan, dan audit laporan kas digital.');

-- ── Portfolios ───────────────────────────────────────────────────────────────
-- owner_id: 2 = Ahmad Fauzi (RPL), 3 = Siti Rahayu (TKJ), 4 = Rani Dewi (Multimedia), NULL = karya sekolah/guru
INSERT INTO portfolios
  (id, title, slug, short_description, description, student_name, class_name, major,
   category_id, tech_stack, project_url, repo_url, process_url, thumbnail_url, screenshots,
   year, status, is_featured, owner_id)
VALUES
(
  1,
  'Sistem Informasi Perpustakaan',
  'sistem-informasi-perpustakaan',
  'Aplikasi web untuk mengelola peminjaman buku di perpustakaan sekolah.',
  'Sistem informasi perpustakaan ini dibuat untuk membantu petugas perpustakaan dalam mengelola data buku, anggota, dan transaksi peminjaman secara digital. Fitur utama meliputi manajemen buku, manajemen anggota, pencatatan peminjaman dan pengembalian, serta laporan bulanan.',
  'Ahmad Fauzi',
  'XII RPL 1',
  'Rekayasa Perangkat Lunak (RPL)',
  1,
  '["PHP", "MySQL", "Bootstrap", "jQuery"]',
  'https://contoh.com/perpustakaan',
  'https://github.com/example/perpustakaan',
  '',
  'https://picsum.photos/seed/perpustakaan/600/400',
  '["https://picsum.photos/seed/perpustakaan-1/800/500","https://picsum.photos/seed/perpustakaan-2/800/500"]',
  2025,
  'published',
  1,
  2
),
(
  2,
  'Aplikasi Absensi Mobile',
  'aplikasi-absensi-mobile',
  'Aplikasi absensi siswa berbasis Android dengan QR Code.',
  'Aplikasi Android untuk memudahkan proses absensi siswa menggunakan teknologi QR Code. Guru dapat membuat sesi absensi dan siswa melakukan scan kode untuk mencatat kehadiran. Data tersinkronisasi secara real-time ke server.',
  'Ahmad Fauzi',
  'XII RPL 1',
  'Rekayasa Perangkat Lunak (RPL)',
  2,
  '["Kotlin", "Firebase", "Android Studio", "QR Code"]',
  '',
  'https://github.com/example/absensi-mobile',
  '',
  'https://picsum.photos/seed/absensi/600/400',
  '["https://picsum.photos/seed/absensi-1/800/500"]',
  2025,
  'draft',
  0,
  2
),
(
  3,
  'Company Profile UMKM Batik Sekar Melati',
  'company-profile-umkm-batik-sekar-melati',
  'Website profil usaha batik lokal dengan katalog motif dan galeri virtual.',
  'Proyek kolaborasi untuk UMKM pengrajin batik tradisional di sekitar lingkungan sekolah. Menyajikan kisah budaya, filosofi motif batik tulis, daftar produk unggulan, formulir pesanan custom, serta tur galeri virtual berbasis gambar interaktif.',
  'Rani Dewi',
  'XII Multimedia 1',
  'Desain Komunikasi Visual / Multimedia',
  3,
  '["Vite", "React", "Framer Motion", "Tailwind CSS"]',
  'https://batik-sekarmelati.id.demo',
  'https://github.com/example/batik-sekar-melati',
  '',
  'https://picsum.photos/seed/batik-sekar/600/400',
  '["https://picsum.photos/seed/batik-sekar-1/800/500","https://picsum.photos/seed/batik-sekar-2/800/500"]',
  2024,
  'published',
  1,
  4
),
(
  4,
  'Aplikasi Monitoring Jaringan Lab Komputer (NetLab)',
  'aplikasi-monitoring-jaringan-lab-komputer-netlab',
  'Dashboard pemantau status koneksi router dan komputer lab sekolah.',
  'Proyek unggulan siswa TKJ untuk memantau beban bandwidth, status online/offline tiap PC client di 4 laboratorium komputer, serta peringatan otomatis via notifikasi web jika terjadi packet loss di jaringan lokal sekolah.',
  'Siti Rahayu',
  'XI TKJ 2',
  'Teknik Komputer & Jaringan (TKJ)',
  4,
  '["React", "Chart.js", "RouterOS API", "Node.js"]',
  'https://netlab-smk.internal-demo.net',
  'https://github.com/example/mikrotik-lab-monitor',
  '',
  'https://picsum.photos/seed/netlab-smk/600/400',
  '["https://picsum.photos/seed/netlab-1/800/500","https://picsum.photos/seed/netlab-2/800/500"]',
  2024,
  'published',
  0,
  3
),
(
  5,
  'Simulasi Pembukuan & Laporan Keuangan UMKM (BukuKas)',
  'simulasi-pembukuan-keuangan-umkm-bukukas',
  'Aplikasi pembukuan jurnal umum, buku besar, dan neraca saldo untuk UMKM.',
  'Dibuat oleh kolaborasi siswa Akuntansi dan RPL untuk mempermudah praktikum akuntansi komputer sekaligus membantu usaha mikro. Menyediakan form entri jurnal berpasangan, pembuatan buku besar otomatis, dan laporan arus kas siap cetak.',
  'Anisa Rahmawati & Tim Akuntansi',
  'XII Akuntansi 1',
  'Akuntansi & Keuangan Lembaga',
  1,
  '["React", "Tailwind CSS", "SheetJS", "LocalForage"]',
  'https://bukukas-smk-demo.vercel.app',
  'https://github.com/example/akuntansi-bukukas',
  '',
  'https://picsum.photos/seed/bukukas-smk/600/400',
  '["https://picsum.photos/seed/bukukas-1/800/500","https://picsum.photos/seed/bukukas-2/800/500"]',
  2026,
  'published',
  1,
  NULL
),
(
  6,
  'Toko Online Kerajinan Anyaman Bambu',
  'toko-online-kerajinan-anyaman-bambu',
  'E-commerce produk anyaman bambu desa binaan dengan keranjang belanja.',
  'Toko online lengkap yang menghadirkan katalog berbagai produk home decor berbahan baku anyaman bambu lestari. Dilengkapi filter harga, keranjang belanja interaktif, kalkulator ongkos kirim sederhana, dan checkout langsung via WhatsApp Business.',
  'Bagus Pratama',
  'XI RPL 1',
  'Rekayasa Perangkat Lunak (RPL)',
  2,
  '["React", "Zustand", "Tailwind CSS", "Supabase"]',
  'https://bambucraft-demo.netlify.app',
  'https://github.com/example/bambu-craft-ecommerce',
  '',
  'https://picsum.photos/seed/bambucraft/600/400',
  '["https://picsum.photos/seed/bambucraft-1/800/500","https://picsum.photos/seed/bambucraft-2/800/500"]',
  2025,
  'published',
  0,
  NULL
),
(
  7,
  'Portal Berita & Buletin Ekstrakurikuler (WartaSiswa)',
  'portal-berita-buletin-ekskul-wartasiswa',
  'Website publikasi karya jurnalistik dan info ekstrakurikuler siswa.',
  'WartaSiswa merupakan wadah kreatif klub jurnalistik sekolah. Menampilkan rubrik tulisan ilmiah remaja, liputan kompetisi olahraga antar sekolah, rubrik komik strip interaktif, dan kanal podcast audio buatan siswa.',
  'Rani Dewi',
  'XII Multimedia 1',
  'Desain Komunikasi Visual / Multimedia',
  5,
  '["Next.js", "Tailwind CSS", "Markdown", "Vercel"]',
  'https://wartasiswa.sch.id.demo',
  'https://github.com/example/wartasiswa-smk',
  '',
  'https://picsum.photos/seed/wartasiswa/600/400',
  '["https://picsum.photos/seed/warta-1/800/500","https://picsum.photos/seed/warta-2/800/500"]',
  2026,
  'published',
  0,
  4
),
(
  8,
  'Aplikasi Inventaris Peralatan Bengkel TKJ',
  'aplikasi-inventaris-bengkel-tkj',
  'Pencatatan peminjaman alat praktik bengkel dengan barcode scanner.',
  'Proyek manajemen aset inventaris bengkel agar alat praktik siswa tidak hilang atau rusak tanpa pertanggungjawaban. Menggunakan barcode scanner pada kamera ponsel untuk check-out dan check-in alat.',
  'Siti Rahayu',
  'XI TKJ 2',
  'Teknik Komputer & Jaringan (TKJ)',
  4,
  '["React", "Zustand", "Tailwind CSS", "WebRTC"]',
  'https://inventaris-bengkel.smk.demo',
  'https://github.com/example/inventaris-bengkel-smk',
  '',
  'https://picsum.photos/seed/inventaris-bengkel/600/400',
  '["https://picsum.photos/seed/inven-1/800/500"]',
  2026,
  'draft',
  0,
  3
);

-- ── Reviews ──────────────────────────────────────────────────────────────────
-- Hanya untuk portofolio berstatus published (id 1, 3, 4, 5, 6, 7).
-- name unik per portfolio (UNIQUE KEY portfolio_id + name).
INSERT INTO reviews (id, portfolio_id, name, rating, comment) VALUES
(
  1,
  1,
  'Pak Hendra, Guru Pembimbing',
  5,
  'Karya yang sangat impresif! Fitur laporan bulanannya benar-benar membantu petugas perpustakaan. UI-nya bersih dan mudah dipakai.'
),
(
  2,
  1,
  'Dita Kumala',
  5,
  'Sistem digital yang sangat berguna untuk perpustakaan sekolah kami. Mantap sekali!'
),
(
  3,
  1,
  'Budi Santoso',
  4,
  'Desain antarmukanya responsif. Mungkin bisa ditambah fitur cetak struk peminjaman.'
),
(
  4,
  3,
  'Pengunjung Website',
  5,
  'Desain websitenya cantik sekali dan menampilkan budaya batik dengan elegan. Sangat kreatif!'
),
(
  5,
  3,
  'Dwi Astuti',
  4,
  'Galeri motif batiknya interaktif dan mudah dinavigasi. Keren untuk karya SMK!'
),
(
  6,
  4,
  'Teknisi Sekolah',
  5,
  'Monitoring jaringan jadi jauh lebih mudah. Dashboard real-time-nya sangat membantu pekerjaan sehari-hari.'
),
(
  7,
  5,
  'Kepala Koperasi',
  5,
  'Akhirnya ada alat pembukuan digital yang cocok untuk UMKM. Laporan neraca saldonya akurat!'
),
(
  8,
  6,
  'Pak Rizal',
  4,
  'E-commerce yang fungsional dengan fitur keranjang yang bekerja lancar di berbagai perangkat.'
),
(
  9,
  7,
  'Pembina OSIS',
  4,
  'Platform jurnalistik yang keren! Siswa jadi lebih semangat menulis dan berbagi karya.'
),
(
  10,
  7,
  'Mira Lestari',
  3,
  'Fiturnya sudah bagus, tapi tampilan mobile-nya masih perlu sedikit perbaikan.'
);
