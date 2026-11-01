# Database Portofolio Sekolah

Skema dan data awal untuk MariaDB 10.4+ (XAMPP / phpMyAdmin).

## File

| File | Isi |
|------|-----|
| `create_database.sql` | Membuat database `portofolio_sekolah` (jalankan pertama). |
| `schema.sql` | Struktur tabel saja (`users`, `categories`, `portfolios`, `reviews`). Aman dijalankan berulang (`IF NOT EXISTS`). |
| `seed.sql` | Data awal untuk development. **Menghapus semua data lama lalu mengisi ulang.** |

## Urutan Import di phpMyAdmin

1. **`create_database.sql`** — buat database. Lalu pilih database `portofolio_sekolah` di panel kiri.
2. **`schema.sql`** — buat struktur tabel.
3. **`seed.sql`** — isi data awal.

Cara import: tab **Import** → pilih file → **Go**.

## Akun Demo

| Role | Email | Password |
|------|-------|----------|
| Admin (guru) | `admin@sekolah.sch.id` | `admin123` |
| Murid | `ahmad@siswa.sch.id` | `siswa123` |
| Murid | `siti@siswa.sch.id` | `siswa123` |
| Murid | `rani@siswa.sch.id` | `siswa123` |

## Catatan Penting (Perubahan Struktur)

Karena struktur tabel berubah (kolom baru di `users`, `owner_id` di `portfolios`, dsb.), **database lama harus dihapus lalu dibuat ulang**. Jalankan ulang ketiga file secara berurutan:

1. Hapus database lama (di phpMyAdmin: klik database → tab **Operations** → **Drop database**, atau jalankan `DROP DATABASE portofolio_sekolah;`).
2. Import `create_database.sql` → `schema.sql` → `seed.sql`.

> Catatan: `seed.sql` mengosongkan tabel (`reviews`, `portfolios`, `categories`, `users`) dengan `DELETE` (bukan `TRUNCATE`) serta mereset `AUTO_INCREMENT` dalam blok `FOREIGN_KEY_CHECKS = 0`. **Jangan** jalankan `seed.sql` di database yang sudah berisi data asli.
