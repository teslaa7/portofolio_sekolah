# Portofolio Sekolah — Frontend

Galeri karya siswa dengan panel admin (guru) dan panel murid. Dibangun dengan React 19 + Vite + Tailwind CSS, terhubung ke backend Fastify (`/backend`).

## Prasyarat

- Node.js >= 20.19.0
- Backend Fastify berjalan di `http://localhost:3001` (lihat folder `/backend`)

## Menjalankan

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

Aplikasi berjalan di `http://localhost:3000`. Base URL backend diatur via `VITE_API_BASE_URL` (default `http://localhost:3001/api`).

> **Login admin awal** dibuat dari `database/seed.sql`; segera ganti password melalui menu **Edit Profil** di panel setelah pertama kali masuk.

## Fitur

- **Publik**: galeri karya, detail portofolio + ulasan, kirim ulasan sebagai tamu.
- **Murid**: "Karya Saya" — tambah/edit/hapus karya milik sendiri; Edit Profil; Komentar & Ulasan.
- **Admin**: kelola semua karya, kategori, akun murid (`/admin/murid`), dashboard, Edit Profil.

Token disimpan di `localStorage` (`portofolio_token`); sesi dipulihkan via `GET /auth/me` saat aplikasi dimuat.

## Build

```bash
npm run build   # output ke dist/
npm run preview # pratinjau build
```
