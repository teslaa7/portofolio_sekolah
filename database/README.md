# Database Portofolio Sekolah

Skema dan data awal untuk MariaDB 10.4+ (XAMPP / phpMyAdmin).

## File

| File | Isi |
|------|-----|
| `create_database.sql` | Membuat database `portofolio_sekolah` (jalankan pertama). |
| `schema.sql` | Struktur tabel (`users`, `categories`, `portfolios`, `reviews`, `majors`). Aman dijalankan berulang (`IF NOT EXISTS`). |
| `seed.sql` | Data awal untuk development. **Menghapus semua data lama lalu mengisi ulang.** |
| `migrations/001_majors_and_process_url.sql` | Migrasi untuk database yang sudah ada: tambah tabel `majors`, kolom `process_url`, dan 4 jurusan awal. |

## Setup Baru (database kosong)

1. **`create_database.sql`** — buat database.
2. **`schema.sql`** — buat struktur tabel.
3. **`seed.sql`** — isi data awal.

Cara import di phpMyAdmin: pilih database → tab **Import** → pilih file → **Go**.

## Migrasi (database yang sudah ada)

Jalankan `migrations/001_majors_and_process_url.sql` di phpMyAdmin:
1. Pilih database `portofolio_sekolah`.
2. Tab **Import** → pilih `migrations/001_majors_and_process_url.sql` → **Go**.

Migrasi ini bersifat idempotent — aman dijalankan lebih dari sekali. Setelah migrasi:
- Tabel `majors` terisi 4 jurusan.
- Kolom `process_url` tersedia di `portfolios` (semua baris lama bernilai `''`).
- Data karya & murid lama tetap cocok karena nama jurusan di tabel `majors` identik dengan nama yang sudah digunakan.

> **Login admin awal** tersedia di `seed.sql`. Segera ganti password melalui menu **Edit Profil** setelah pertama kali masuk.

> `seed.sql` mengosongkan semua tabel. **Jangan** jalankan di database production yang sudah berisi data asli.
