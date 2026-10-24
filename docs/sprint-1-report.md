# Laporan Sprint 1

Tanggal: 24 Oktober 2026 (WIB). **Status: implementasi lokal tersedia, penerimaan integrasi terblokir; belum selesai penuh atau deploy.** Persetujuan pengguna untuk Sprint 1 telah diberikan. Klarifikasi terakhir pengguna: seluruh akun teknis milik Vini. Gunakan Supabase **PROYEK MASHURA** dan Vercel yang melayani `https://mashura.vercel.app/`; plugin belum tersedia di tool percakapan sehingga ID/team/schema existing belum bisa diverifikasi. Firdi tetap operator bisnis menurut PRD.

## Hasil

Fondasi Next.js/TypeScript dan CI, admin bisnis berotorisasi server, settings/branding dinamis, kategori, workflow produk lima tahap dan enam tipe materi, draft/publish/preview/duplikasi/unpublish, unggulan/banner, upload dan preview privat, migration RLS, histori harga dan audit sudah diimplementasikan. Tidak membuat aplikasi pembayaran/member/finance dari sprint berikutnya; tab pesanan/keuangan menampilkan penjelasan belum aktif tanpa angka fiktif.

File utama: `src/app/admin/`, `src/components/*editor.tsx`, `src/lib/catalog.ts`, `src/lib/auth.ts`, `src/app/actions.ts`, `src/app/api/`, `supabase/migrations/202610240001_catalog.sql`, `supabase/bootstrap-admin.sql`, `tests/`, dan workflow CI. Panduan operasional: [development.md](development.md).

## Bukti dan keterbatasan

| Pemeriksaan | Hasil |
|---|---|
| npm install / lockfile | Terpasang dan lockfile disimpan; npm ci juga diverifikasi sebelum penyerahan |
| ESLint / strict TypeScript | Lulus lokal |
| Production build Next.js | Lulus lokal; seluruh route admin dinamis dan melakukan autentikasi runtime |
| Unit + komponen + PostgreSQL migration/RPC/RLS | 28 lulus; server actions komponen dimock, shim auth/storage PGlite dijelaskan di test |
| Chromium smoke HP/desktop | 8 lulus: public/login, redirect anonim, CSRF upload, tanpa horizontal overflow public/login |
| PRD asli | Tetap identik dengan baseline Sprint 0 |
| Supabase lokal lengkap | Gagal pull/ekstraksi image karena registry dan kapasitas Docker; tidak dijalankan |
| Supabase remote / Vercel | Tidak terhubung, tidak dibuat, tidak deploy |
| Acceptance AC01–03/13/14 end-to-end admin HP | Belum tuntas; perlu Auth/Storage/backend nyata |
| GitHub CI | Workflow tersedia, hasil remote tidak diasumsikan |

SQL negatif yang lulus meliputi anonymous/member/technical admin tak bisa menulis katalog/role, profil antar member terisolasi, draft tersembunyi, body materi privat tidak terbuka, private object tersembunyi, storage delete tidak diizinkan, role revoke segera efektif, publish/harga divalidasi DB, audit immutable dan enam tipe produk dapat disimpan. Ini tidak setara dengan uji HTTP layanan Supabase nyata.

## Pekerjaan tersisa untuk menuntaskan Sprint 1

1. Hubungkan plugin Supabase dan Vercel milik Vini ke percakapan ini; verifikasi project **PROYEK MASHURA** dan project domain `mashura.vercel.app`, ID/team/schema/bucket/migration existing. Jangan meminta atau menaruh credential di chat. Alternatif: lingkungan Docker dengan kapasitas dan akses registry memadai untuk backend lokal.
2. Terapkan migration pada MASHURA yang benar, buat/invite akun Auth terverifikasi Firdi dan bootstrap role secara terotorisasi; verifikasi upload/storage policy HTTP.
3. Jalankan penerimaan admin dari HP kecil: produk LMS dan PDF lengkap, branding tanpa redeploy, non-admin/RLS negatif, duplikasi, penggantian file aman, audit perubahan harga. Dokumentasikan hasil dan perbaiki kegagalan.
4. Bila deployment preview diotorisasi dan akun tersedia, pasang konfigurasi MASHURA staging yang terpisah; verifikasi preview tanpa live secret. Belum melanjutkan Sprint 2.

Tidak ada resource, data atau credential BADAI yang digunakan.

Kode akan diserahkan pada cabang `sprint-1/admin-catalog`, tanpa merge ke main. Deployment otomatis preview yang mungkin dipicu GitHub belum diperiksa melalui Vercel. Guard project-reference menolak koneksi remote tanpa target MASHURA yang dipin secara eksplisit.
