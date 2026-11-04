# Backend – Portofolio Sekolah

REST API untuk aplikasi Portofolio Sekolah, dibangun dengan **Fastify v5** + **mysql2** (MariaDB).

---

## Prasyarat

- **Node.js >= 20**
- MariaDB / MySQL (XAMPP untuk lokal)

---

## Persiapan Database (XAMPP / phpMyAdmin)

Jalankan file SQL di folder `../database/` secara berurutan:

1. **`create_database.sql`** — membuat database `portofolio_sekolah`.
2. **`schema.sql`** — membuat struktur tabel.
3. **`seed.sql`** — mengisi data awal.

> **Login admin awal** dibuat dari `seed.sql`; segera ganti password melalui menu **Edit Profil** setelah pertama kali masuk.

---

## Cara Menjalankan di Localhost

```bash
cd backend
cp .env.example .env   # sesuaikan kredensial DB lokal
npm install
npm run dev
```

Server berjalan di `http://localhost:3001`.

---

## Hak Akses

- **Publik**: melihat portofolio published, ulasan, ringkasan rating.
- **Murid (student)**: mengelola karya miliknya sendiri; edit profil sendiri; melihat ulasan karya sendiri dan karya murid lain.
- **Admin (guru)**: mengelola semua karya, kategori, akun murid, dashboard, edit profil sendiri, hapus ulasan.

---

## Endpoint Ringkas

| Method | Path | Akses | Keterangan |
|--------|------|-------|-----------|
| GET | /api/health | Publik | Cek status server & DB |
| POST | /api/auth/login | Publik | Login, balas JWT |
| POST | /api/auth/register | Publik | Daftar akun murid baru |
| GET | /api/auth/me | Token | Profil user saat ini |
| POST | /api/auth/logout | Token | Logout (stateless) |
| PUT | /api/auth/profile | Token | Update nama/avatar/kelas/jurusan |
| PUT | /api/auth/password | Token | Ganti password |
| GET | /api/portfolios | Publik | List dengan filter & paginasi |
| GET | /api/portfolios/related | Publik | Portofolio terkait |
| GET | /api/portfolios/:slug | Publik | Detail by slug |
| GET | /api/admin/portfolios/:id | Admin/Pemilik | Detail by ID |
| POST | /api/portfolios | Admin/Murid | Tambah karya |
| PUT | /api/portfolios/:id | Admin/Murid | Update karya |
| DELETE | /api/portfolios/:id | Admin/Murid | Hapus karya |
| GET | /api/categories | Publik | Daftar kategori |
| POST | /api/categories | Admin | Tambah kategori |
| PUT | /api/categories/:id | Admin | Update kategori |
| DELETE | /api/categories/:id | Admin | Hapus kategori |
| GET | /api/students | Admin | Daftar murid |
| POST | /api/students | Admin | Tambah murid |
| PUT | /api/students/:id | Admin | Update murid |
| DELETE | /api/students/:id | Admin | Hapus murid |
| GET | /api/portfolios/:id/reviews | Publik | Daftar ulasan |
| GET | /api/portfolios/:id/reviews/summary | Publik | Ringkasan rating |
| POST | /api/portfolios/:id/reviews | Publik | Kirim ulasan |
| GET | /api/reviews/latest | Publik | Ulasan terbaru |
| GET | /api/reviews/mine | Token (Auth) | Ulasan di karya milik user login |
| GET | /api/reviews/community | Token (Auth) | Ulasan karya murid lain |
| DELETE | /api/reviews/:id | Admin | Hapus ulasan |
| GET | /api/dashboard/summary | Admin | Statistik dashboard |

---

## Deploy ke cPanel

1. Upload folder `backend/` ke server (kecuali `node_modules/`).
2. Di cPanel → **Setup Node.js App** — application startup file: `server.js`.
3. Isi environment variables (lihat `.env.example`).
4. Klik **Run NPM Install**, lalu **Restart**.
