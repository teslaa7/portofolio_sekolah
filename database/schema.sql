-- ============================================================
-- Portofolio Sekolah - schema.sql (HANYA struktur tabel)
-- Untuk MariaDB 10.4+ (XAMPP / phpMyAdmin / cPanel)
-- Cara pakai: pilih database di phpMyAdmin -> tab Import -> pilih file ini.
-- Aman dijalankan berulang (IF NOT EXISTS), tidak menghapus data.
-- ============================================================

SET NAMES utf8mb4;

CREATE TABLE IF NOT EXISTS users (
  id          BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name        VARCHAR(150) NOT NULL,
  email       VARCHAR(150) NOT NULL,
  password    VARCHAR(255) NOT NULL COMMENT 'hash bcrypt, bukan teks asli',
  role        ENUM('admin') NOT NULL DEFAULT 'admin',
  avatar      VARCHAR(500) NULL,
  created_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_users_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS categories (
  id          BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name        VARCHAR(100) NOT NULL,
  slug        VARCHAR(120) NOT NULL,
  created_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_categories_name (name),
  UNIQUE KEY uq_categories_slug (slug)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- tech_stack dan screenshots disimpan sebagai teks JSON (kompatibel semua versi MariaDB).
-- Backend wajib JSON.parse saat membaca dan JSON.stringify saat menyimpan.
CREATE TABLE IF NOT EXISTS portfolios (
  id                 BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  title              VARCHAR(200) NOT NULL,
  slug               VARCHAR(220) NOT NULL,
  short_description  VARCHAR(150) NOT NULL DEFAULT '',
  description        TEXT NULL,
  student_name       VARCHAR(150) NOT NULL,
  class_name         VARCHAR(50)  NOT NULL DEFAULT '',
  major              VARCHAR(100) NOT NULL COMMENT 'nama lengkap jurusan, sama dengan MAJORS di frontend',
  category_id        BIGINT UNSIGNED NOT NULL,
  tech_stack         TEXT NULL COMMENT 'JSON array string',
  project_url        VARCHAR(500) NOT NULL DEFAULT '',
  repo_url           VARCHAR(500) NOT NULL DEFAULT '',
  thumbnail_url      VARCHAR(500) NOT NULL DEFAULT '',
  screenshots        TEXT NULL COMMENT 'JSON array string',
  year               SMALLINT UNSIGNED NOT NULL,
  status             ENUM('draft','published') NOT NULL DEFAULT 'draft',
  is_featured        TINYINT(1) NOT NULL DEFAULT 0,
  created_at         TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at         TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_portfolios_slug (slug),
  KEY idx_portfolios_status_created (status, created_at),
  KEY idx_portfolios_category (category_id),
  KEY idx_portfolios_major (major),
  KEY idx_portfolios_year (year),
  KEY idx_portfolios_featured (is_featured),
  CONSTRAINT fk_portfolios_category FOREIGN KEY (category_id) REFERENCES categories(id)
    ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
