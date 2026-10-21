# Backend – Portofolio Sekolah

REST API untuk aplikasi Portofolio Sekolah, dibangun dengan **FastifyJS v5** + **MariaDB**.

---

## Prasyarat

- Node.js LTS ≥ 18
- MariaDB / MySQL (XAMPP untuk lokal)

---

## Cara Menjalankan di Localhost

```bash
# 1. Masuk folder backend
cd backend

# 2. Salin file konfigurasi
cp .env.example .env
# Edit .env sesuai pengaturan database lokal Anda

# 3. Impor database (di phpMyAdmin: New database → portofolio_sekolah → Import → seed.sql)

# 4. Install dependencies
npm install

# 5. Jalankan dev server (auto-restart saat file berubah)
npm run dev
```

Server berjalan di `http://localhost:3001`.

---

## Endpoint Ringkas

| Method | Path | Akses | Keterangan |
|--------|------|-------|-----------|
| GET | /api/health | Publik | Cek status server & DB |
| POST | /api/auth/login | Publik | Login, balas JWT |
| GET | /api/auth/me | Token | Data user saat ini |
| POST | /api/auth/logout | Token | Logout (stateless) |
| GET | /api/portfolios | Publik/Admin | List dengan filter & pagination |
| GET | /api/portfolios/related | Publik | Portofolio terkait |
| GET | /api/portfolios/:slug | Publik/Admin | Detail by slug |
| GET | /api/admin/portfolios/:id | Admin | Detail by ID |
| POST | /api/portfolios | Admin | Tambah portofolio |
| PUT | /api/portfolios/:id | Admin | Update portofolio |
| DELETE | /api/portfolios/:id | Admin | Hapus portofolio |
| GET | /api/categories | Publik | Daftar kategori |
| GET | /api/categories/:id | Publik | Detail kategori |
| POST | /api/categories | Admin | Tambah kategori |
| PUT | /api/categories/:id | Admin | Update kategori |
| DELETE | /api/categories/:id | Admin | Hapus kategori |
| GET | /api/dashboard/summary | Admin | Statistik dashboard |

---

## Contoh curl

### Health Check
```bash
curl http://localhost:3001/api/health
```

### Login
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@sekolah.sch.id","password":"admin123"}'
```

### List portofolio (publik – hanya published)
```bash
curl "http://localhost:3001/api/portfolios?page=1&limit=9&sortBy=latest"
```

### List portofolio sebagai admin (termasuk draft)
```bash
TOKEN="<token dari login>"
curl "http://localhost:3001/api/portfolios?limit=1000" \
  -H "Authorization: Bearer $TOKEN"
```

### Tambah portofolio
```bash
curl -X POST http://localhost:3001/api/portfolios \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Aplikasi Kasir Sekolah",
    "description": "Sistem kasir untuk kantin sekolah.",
    "short_description": "Kasir kantin berbasis web.",
    "student_name": "Andi Wijaya",
    "class_name": "XI RPL 1",
    "major": "Rekayasa Perangkat Lunak (RPL)",
    "category_id": 1,
    "year": 2026,
    "status": "draft",
    "is_featured": false,
    "tech_stack": ["React","Node.js"],
    "screenshots": []
  }'
```

### Update portofolio
```bash
curl -X PUT http://localhost:3001/api/portfolios/1 \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status":"published","is_featured":true}'
```

### Hapus portofolio
```bash
curl -X DELETE http://localhost:3001/api/portfolios/2 \
  -H "Authorization: Bearer $TOKEN"
```

### Tambah kategori
```bash
curl -X POST http://localhost:3001/api/categories \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Game Development"}'
```

### Tambah kategori duplikat (harusnya 409)
```bash
curl -X POST http://localhost:3001/api/categories \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Aplikasi Web"}'
```

### Hapus kategori yang masih dipakai (harusnya 409)
```bash
curl -X DELETE http://localhost:3001/api/categories/1 \
  -H "Authorization: Bearer $TOKEN"
```

### Dashboard summary
```bash
curl http://localhost:3001/api/dashboard/summary \
  -H "Authorization: Bearer $TOKEN"
```

---

## Deploy ke cPanel (Phusion Passenger)

1. Upload folder `backend/` ke server (kecuali `node_modules/`).
2. Di cPanel → **Setup Node.js App**:
   - Application root: `path/ke/backend`
   - Application startup file: `server.js`
   - Node.js version: pilih LTS
3. Isi semua **Environment Variables** sesuai `.env.example` (terutama `JWT_SECRET` yang kuat, `DB_HOST`, `DB_NAME`, dll.)
4. Klik **Run NPM Install**.
5. Klik **Restart** untuk memulai aplikasi.
6. Tes `https://domain-api-anda/api/health`.

> **Catatan:** Pastikan paket hosting mendukung fitur *Setup Node.js App* (Passenger). Jika tidak tersedia, perlu VPS atau layanan cloud.
