-- ============================================================
-- Migrasi 002: Perbesar kolom users.avatar agar muat data URL base64
-- Idempotent — aman dijalankan berulang (MODIFY hanya mengatur tipe yang sama).
-- Cara pakai: phpMyAdmin → pilih database → Import → file ini.
-- ============================================================

SET NAMES utf8mb4;

-- avatar kini MEDIUMTEXT agar bisa menyimpan data URL base64 foto profil
-- (selain URL http(s) lama yang tetap kompatibel).
ALTER TABLE users
  MODIFY COLUMN avatar MEDIUMTEXT NULL COMMENT 'URL gambar atau data URL base64';
