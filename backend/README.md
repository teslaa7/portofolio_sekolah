# Backend – Portofolio Sekolah

REST API untuk aplikasi Portofolio Sekolah, dibangun dengan **Fastify v5** + **mysql2** (MariaDB).

---

## Prasyarat

- **Node.js >= 20**
- MariaDB / MySQL (XAMPP untuk lokal)

---

## Persiapan Database (XAMPP / phpMyAdmin)

Karena struktur tabel berubah (kolom `class_name`/`major`/`is_active` di `users`, `owner_id` di `portfolios`), database lama harus dihapus lalu dibuat ulang. Jalankan file SQL di folder `../database/` secara berurutan:

1. **`create_database.sql`** — membuat database `portofolio_sekolah` (drop dulu yang lama bila perlu).
2. **`schema.sql`** — membuat struktur tabel.
3. **`seed.sql`** — mengisi data awal.

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
- **Murid (student)**: mengelola karya miliknya sendiri (tambah/edit/hapus). Tidak bisa mengatur `is_featured`/`owner_id`. Endpoint `mine=true` membatasi ke karyanya.
- **Admin (guru)**: mengelola semua karya, mengelola kategori, mengelola akun murid (`/api/students`), melihat dashboard.
- JWT opsional pada GET portofolio: token valid → identitas {id, role}; tanpa token → tamu.

---

## Endpoint Ringkas

| Method | Path | Akses | Keterangan |
|--------|------|-------|-----------|
| GET | /api/health | Publik | Cek status server & DB |
| POST | /api/auth/login | Publik | Login, balas JWT |
| GET | /api/auth/me | Token | Profil user saat ini (401 jika nonaktif) |
| POST | /api/auth/logout | Token | Logout (stateless) |
| GET | /api/portfolios | Publik/Admin/Murid | List; `mine=true` (token) untuk karya sendiri |
| GET | /api/portfolios/related | Publik | Portofolio terkait |
| GET | /api/portfolios/:slug | Publik/Admin/Pemilik | Detail by slug |
| GET | /api/admin/portfolios/:id | Admin/Pemilik | Detail by ID (403 jika bukan milik) |
| POST | /api/portfolios | Admin/Murid | Tambah; murid → owner_id sendiri, admin → owner_id dari body |
| PUT | /api/portfolios/:id | Admin/Murid | Update; murid hanya miliknya, `is_featured`/`owner_id` diabaikan |
| DELETE | /api/portfolios/:id | Admin/Murid | Hapus; murid hanya miliknya |
| GET | /api/categories | Publik | Daftar kategori |
| GET | /api/categories/:id | Publik | Detail kategori |
| POST | /api/categories | Admin | Tambah kategori |
| PUT | /api/categories/:id | Admin | Update kategori |
| DELETE | /api/categories/:id | Admin | Hapus kategori |
| GET | /api/students | Admin | Daftar murid (search, is_active, paginasi) |
| GET | /api/students/:id | Admin | Detail murid |
| POST | /api/students | Admin | Tambah murid |
| PUT | /api/students/:id | Admin | Update murid (password opsional = reset) |
| DELETE | /api/students/:id | Admin | Hapus murid (karyanya tetap, owner_id NULL) |
| GET | /api/portfolios/:id/reviews | Publik | Daftar ulasan (published only) |
| GET | /api/portfolios/:id/reviews/summary | Publik | Ringkasan rating |
| POST | /api/portfolios/:id/reviews | Publik | Kirim ulasan (upsert by nama) |
| DELETE | /api/reviews/:id | Admin | Hapus ulasan |
| GET | /api/reviews/latest | Publik | Ulasan terbaru |
| GET | /api/dashboard/summary | Admin | Statistik dashboard (termasuk studentsCount) |

---

## Contoh curl

### Login admin & login murid
```bash
# Admin
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@sekolah.sch.id","password":"admin123"}'

# Murid
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"ahmad@siswa.sch.id","password":"siswa123"}'
```

### Murid menambah karya (owner_id otomatis = id murid, is_featured paksa false)
```bash
MURID="<token murid>"
curl -X POST http://localhost:3001/api/portfolios \
  -H "Authorization: Bearer $MURID" -H "Content-Type: application/json" \
  -d '{
    "title":"Aplikasi Kasir Kantin",
    "description":"Kasir kantin berbasis web.",
    "short_description":"Kasir kantin sekolah.",
    "student_name":"Ahmad Fauzi","class_name":"XII RPL 1",
    "major":"Rekayasa Perangkat Lunak (RPL)","category_id":1,"year":2026
  }'
```

### Murid mencoba mengubah karya milik murid lain (harus 403)
```bash
curl -X PUT http://localhost:3001/api/portfolios/4 \
  -H "Authorization: Bearer $MURID" -H "Content-Type: application/json" \
  -d '{"status":"draft"}'
# 403 "Anda hanya dapat mengubah karya milik sendiri."
```

### Admin mengelola murid
```bash
ADMIN="<token admin>"

# Tambah murid
curl -X POST http://localhost:3001/api/students \
  -H "Authorization: Bearer $ADMIN" -H "Content-Type: application/json" \
  -d '{"name":"Budi","email":"budi@siswa.sch.id","password":"siswa123",
       "class_name":"XI RPL 1","major":"Rekayasa Perangkat Lunak (RPL)"}'

# Ubah data murid
curl -X PUT http://localhost:3001/api/students/2 \
  -H "Authorization: Bearer $ADMIN" -H "Content-Type: application/json" \
  -d '{"class_name":"XII RPL 1"}'

# Nonaktifkan murid (is_active=false)
curl -X PUT http://localhost:3001/api/students/2 \
  -H "Authorization: Bearer $ADMIN" -H "Content-Type: application/json" \
  -d '{"is_active":false}'

# Reset password (kirim password baru; kosongkan jika tidak ingin mengubah)
curl -X PUT http://localhost:3001/api/students/2 \
  -H "Authorization: Bearer $ADMIN" -H "Content-Type: application/json" \
  -d '{"password":"siswabaru123"}'

# Hapus murid (karyanya tetap ditampilkan tanpa pemilik)
curl -X DELETE http://localhost:3001/api/students/2 \
  -H "Authorization: Bearer $ADMIN"
```

### Login murid nonaktif (harus 403)
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"ahmad@siswa.sch.id","password":"siswa123"}'
# 403 "Akun Anda dinonaktifkan. Hubungi guru/admin."
```

### Dashboard summary (admin)
```bash
curl http://localhost:3001/api/dashboard/summary -H "Authorization: Bearer $ADMIN"
```
