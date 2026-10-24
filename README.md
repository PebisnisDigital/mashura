# MASHURA

Toko produk digital dan membership milik Firdi. Identitas teknis tetap `mashura`; branding toko dapat diubah admin.

**Sprint 1: implementasi fondasi dan admin katalog tersedia; integrasi Supabase nyata dan penerimaan HP masih terblokir. Belum deploy atau siap produksi.** Sprint 2–5 belum dikerjakan. Tidak menggunakan resource BADAI.

## Mulai pengembangan

Node 24 dan npm 11.9.0. `npm ci`, lalu `npm run dev`. Koneksi Supabase MASHURA dan akun admin sah diperlukan untuk dashboard; tanpa konfigurasi, hanya halaman persiapan dan login tersedia. Tidak ada akun demo/password default atau bypass autentikasi.

Ikuti [panduan development](docs/development.md) untuk migration, konfigurasi environment, bootstrap admin dan pengujian. Jangan menjalankan reset pada database berisi data penting.

## Dokumen

- [PRD v1.0 asli](docs/PRD.md) — baseline utama.
- [Laporan Sprint 1 dan keterbatasan validasi](docs/sprint-1-report.md).
- [Panduan pengembangan dan hasil pengujian](docs/development.md).
- [Audit kebutuhan](docs/requirements-audit.md).
- [Arsitektur](docs/architecture.md), [database](docs/database.md), [keamanan](docs/security.md).
- [Roadmap/task board](docs/task-board.md), [checklist pengujian](docs/testing.md).
- [Keputusan dan operasi](docs/decisions-and-operations.md).

`npm run lint`, `npm run typecheck`, `npm test`, `npm run build` dan `npm run test:e2e` tersedia. Lihat batas penggunaan fixture/mock/PGlite pada panduan development; tes tersebut tidak membuktikan integrasi Auth/Storage remote.

Klarifikasi terbaru pengguna: seluruh akun teknis milik Vini; gunakan Supabase **PROYEK MASHURA** dan proyek Vercel yang melayani `https://mashura.vercel.app/`. Identitas resource belum dapat diverifikasi karena tool plugin kedua layanan belum tersedia di percakapan ini. Tidak ada project Supabase/Vercel baru dibuat. Selesaikan integrasi dan penerimaan Sprint 1 sebelum melanjutkan sprint berikutnya.
