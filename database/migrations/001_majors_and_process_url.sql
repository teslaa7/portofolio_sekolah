-- ============================================================
-- Migrasi 001: Tambah tabel majors & kolom process_url
-- Idempotent — aman dijalankan berulang.
-- Cara pakai: phpMyAdmin → pilih database → Import → file ini.
-- ============================================================

SET NAMES utf8mb4;

-- ── 1. Tabel majors ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS majors (
  id          BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name        VARCHAR(100) NOT NULL,
  code        VARCHAR(20)  NOT NULL DEFAULT '',
  description VARCHAR(300) NOT NULL DEFAULT '',
  created_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_majors_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── 2. Kolom process_url di portfolios ───────────────────────────────────────
-- IF NOT EXISTS tersedia di MariaDB 10.3.2+. Idempotent.
ALTER TABLE portfolios
  ADD COLUMN IF NOT EXISTS process_url VARCHAR(500) NOT NULL DEFAULT ''
  COMMENT 'link Google Drive proses pembuatan'
  AFTER repo_url;

-- ── 3. Data awal 4 jurusan ───────────────────────────────────────────────────
-- INSERT IGNORE: tidak gagal jika nama sudah ada (unik).
INSERT IGNORE INTO majors (name, code, description) VALUES
('Rekayasa Perangkat Lunak (RPL)',         'RPL', 'Pengembangan web app modern, sistem informasi manajemen, database relasional, dan mobile PWA.'),
('Teknik Komputer & Jaringan (TKJ)',       'TKJ', 'Administrasi infrastruktur server, otomasi jaringan MikroTik/Cisco, dan monitoring sistem lab.'),
('Desain Komunikasi Visual / Multimedia',  'DKV', 'UI/UX design figma, animasi interaktif, company profile kreatif, dan branding visual digital.'),
('Akuntansi & Keuangan Lembaga',           'AKL', 'Digitalisasi pembukuan UKM, spreadsheet otomatisasi keuangan, dan audit laporan kas digital.');
