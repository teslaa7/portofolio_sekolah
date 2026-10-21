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

-- Bersihkan data lama
TRUNCATE TABLE portfolios;
TRUNCATE TABLE categories;
TRUNCATE TABLE users;

SET FOREIGN_KEY_CHECKS = 1;

-- ── Users ────────────────────────────────────────────────────────────────────
-- Password: admin123  (hash bcrypt cost 10)
INSERT INTO users (name, email, password, role, avatar) VALUES
(
  'Admin Sekolah',
  'admin@sekolah.sch.id',
  '$2a$10$Ez.Qn6GRxj971Q3AnPVXQeMRjxjJuQbt40zv89.haxmNzhhgRD5/.',
  'admin',
  NULL
);

-- ── Categories ───────────────────────────────────────────────────────────────
INSERT INTO categories (id, name, slug) VALUES
(1, 'Aplikasi Web',      'aplikasi-web'),
(2, 'Aplikasi Mobile',   'aplikasi-mobile'),
(3, 'Desain UI/UX',      'desain-ui-ux'),
(4, 'Jaringan',          'jaringan'),
(5, 'Multimedia',        'multimedia');

-- ── Portfolios ───────────────────────────────────────────────────────────────
INSERT INTO portfolios
  (id, title, slug, short_description, description, student_name, class_name, major,
   category_id, tech_stack, project_url, repo_url, thumbnail_url, screenshots,
   year, status, is_featured)
VALUES
(
  1,
  'Sistem Informasi Perpustakaan',
  'sistem-informasi-perpustakaan',
  'Aplikasi web untuk mengelola peminjaman buku di perpustakaan sekolah.',
  'Sistem informasi perpustakaan ini dibuat untuk membantu petugas perpustakaan dalam mengelola data buku, anggota, dan transaksi peminjaman secara digital. Fitur utama meliputi manajemen buku, manajemen anggota, pencatatan peminjaman dan pengembalian, serta laporan bulanan.',
  'Budi Santoso',
  'XII RPL 1',
  'Rekayasa Perangkat Lunak (RPL)',
  1,
  '["PHP", "MySQL", "Bootstrap", "jQuery"]',
  'https://contoh.com/perpustakaan',
  'https://github.com/example/perpustakaan',
  'https://picsum.photos/seed/perpustakaan/600/400',
  '["https://picsum.photos/seed/perpustakaan-1/800/500","https://picsum.photos/seed/perpustakaan-2/800/500"]',
  2025,
  'published',
  1
),
(
  2,
  'Aplikasi Absensi Mobile',
  'aplikasi-absensi-mobile',
  'Aplikasi absensi siswa berbasis Android dengan QR Code.',
  'Aplikasi Android untuk memudahkan proses absensi siswa menggunakan teknologi QR Code. Guru dapat membuat sesi absensi dan siswa melakukan scan kode untuk mencatat kehadiran. Data tersinkronisasi secara real-time ke server.',
  'Siti Rahayu',
  'XII RPL 2',
  'Rekayasa Perangkat Lunak (RPL)',
  2,
  '["Kotlin", "Firebase", "Android Studio", "QR Code"]',
  '',
  'https://github.com/example/absensi-mobile',
  'https://picsum.photos/seed/absensi/600/400',
  '["https://picsum.photos/seed/absensi-1/800/500"]',
  2025,
  'draft',
  0
);
