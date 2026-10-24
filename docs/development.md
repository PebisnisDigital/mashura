# Menjalankan MASHURA — Sprint 1

Status: implementasi fondasi/admin katalog tersimpan di repo. Integrasi end-to-end Supabase Auth/Storage dan penerimaan admin dari HP **belum tervalidasi**, karena backend lokal tidak berhasil menyala dan akun remote belum terhubung. Tidak ada deployment Vercel atau project remote dibuat. Sprint 2 belum dimulai.

## Toolchain dan perintah

Node 24 (`.nvmrc`), npm 11.9.0; versi dependency persis ada di lockfile. Next.js 16.4.3, React 19.3.1, TypeScript strict, Supabase SSR, Vitest, PGlite dan Playwright. Pakai checkout cloud yang ada; tidak perlu worktree baru.

```sh
npm ci
npm run lint
npm run typecheck
npm test
npm run build
npm run dev
```

Jika cache default npm tidak writable pada cloud, gunakan `npm_config_cache=/tmp/mashura-npm` untuk command npm. Tidak menonaktifkan verifikasi TLS/checksum. Tanpa `.env.local`, halaman depan menunjukkan toko sedang disiapkan dan route admin menolak akses; ini bukan demo admin tanpa autentikasi.

## Supabase lokal atau remote MASHURA

1. Pastikan Docker lokal sehat dan tersedia ruang cukup untuk image Supabase/Postgres beserta lapisan VFS; image stack penuh cukup besar. Gunakan `npm run db:start` (CLI dipin dalam devDependencies). Pada cloud ini CLI membutuhkan `SUPABASE_HOME=/tmp/mashura-supabase` karena home default read-only. Jangan mengganti `$HOME`.
2. `supabase/config.toml` memiliki project_id `mashura`, port API 54321 dan database 54322; tanpa seed akun/password. Auth email/password dipakai untuk admin bisnis Sprint 1; member/OTP ditangani Sprint 4. Tidak ada signup admin di aplikasi.
3. Jalankan `npm run db:reset` **hanya database lokal MASHURA yang dipastikan disposable** untuk menerapkan migration. Reset menghapus data lokal. Untuk remote staging/production gunakan migration terkontrol, backup dan review; jangan menjalankan reset remote.
4. Salin `.env.example` ke `.env.local`. Isi `NEXT_PUBLIC_SUPABASE_URL`, publishable/anon key MASHURA, serta `MASHURA_SUPABASE_PROJECT_REF` dari project yang identitasnya sudah diverifikasi melalui konfigurasi aman; jangan commit file itu. Ambil key dari konfigurasi layanan sendiri tanpa menyalin hasil status yang mengandung credential ke chat/log. Aplikasi tidak menggunakan service-role key.
5. Untuk resource remote, organisasi/account dan project ID wajib diverifikasi. Klarifikasi terbaru pengguna menggantikan rekomendasi owner sebelumnya: semua akun teknis milik Vini, target Supabase **PROYEK MASHURA** dan Vercel `https://mashura.vercel.app/`. Tool plugin kedua layanan belum tersedia di chat ini; project ID/team/org/schema belum bisa diverifikasi. Sebelum migration, inspeksi schema, policy, bucket dan histori migration existing agar tidak merusak data/proyek yang sudah ada. Tidak memakai default project CLI atau resource BADAI.
6. Di Supabase MASHURA, operator berwenang membuat/invite pengguna Auth Firdi dengan email terverifikasi dan password aman. Bootstrap role lewat `supabase/bootstrap-admin.sql` menggunakan koneksi operator MASHURA dan variabel psql `admin_user_id` UUID akun terverifikasi. Script sengaja menolak UUID yang belum verified. Tidak membuat default admin/password atau mengizinkan user metadata menjadi role.
7. Login lewat `/masuk`. Admin bisnis dapat kelola pengaturan/kategori/produk; technical_admin belum diberi kemampuan mutasi katalog. Role dicabut pada tabel role oleh operator berwenang; cek role dilakukan kembali pada tiap mutasi dan DB RPC.
8. Test deployment nanti harus memiliki env berbeda per preview/staging/production. Build tanpa env valid tidak membuktikan koneksi database. Jangan menggunakan DB/live secret production untuk preview. Belum deploy Vercel dalam pengerjaan ini.

## Kemampuan Sprint 1 yang diimplementasikan

- Dashboard katalog dengan hitungan nyata dari DB; navigasi HP lima tab dan sidebar desktop.
- Pengaturan nama/logo/favicon/deskripsi/warna/kontak/FAQ/legal dan banner berurutan; nama/title halaman publik membaca settings secara dinamis tanpa deploy ulang. Beranda masih halaman persiapan, bukan katalog Sprint 2.
- Kategori tambah/edit/nonaktif; produk tambah/edit/duplikasi sebagai draft, filter judul/status/tipe, unggulan dan urutan, slug, harga, galeri, FAQ, syarat dan durasi 30/365 hari/selama tersedia.
- Form lima tahap; materi LMS dengan bab dan urutan/pelajaran/lampiran, PDF, template/file, prompt, external link, dan bundle non-nested.
- Publish divalidasi di server dan DB. Materi berbayar tidak berada di tabel produk publik. Non-admin tidak punya table writes/RPC mutasi. Preview admin dan URL privat 60 detik membutuhkan sesi admin bisnis.
- Upload PNG/JPG/WebP/ICO publik, PDF/ZIP/TXT/Office privat, maksimum **3 MB** per file untuk jalur multipart server di bawah limit request Vercel. Ukuran/MIME/signature bytes diperiksa; HTML/SVG/executable ditolak. ZIP/Office tidak dieksekusi dan bukan jaminan antivirus. Limit lebih besar memerlukan desain direct upload tervalidasi, belum dikerjakan.
- Objects Storage immutable: tanpa update/delete policy. Materi diarsipkan, bukan row/file dihapus; file pengganti diberi object baru, aset lama dipertahankan dan ID aset sebelum/sesudah dicatat dalam audit. Inventaris orphan dibersihkan nanti hanya melalui prosedur operator yang memeriksa referensi.
- Perubahan harga harus beralasan; histori harga dan audit write-only dari RPC. Harga coret/promosi kompleks tidak dibuat. Data katalog publik aman; tidak ada cart, checkout, payment atau entitlement delivery pada sprint ini.

## Pengujian dan batas bukti

`npm test`: unit validasi input/upload, komponen editor dengan **server actions dimock**, dan migration/RPC/RLS pada engine PostgreSQL PGlite. Shim test menyediakan schema auth/storage dan role Supabase minimum. SQL migration aplikasi dieksekusi tanpa perubahan. Ini menguji otorisasi SQL, integritas dan atomisitas, tetapi **tidak menguji HTTP GoTrue, PostgREST, Storage atau pengiriman email**.

`npm run test:e2e`: smoke publik/login, redirect anonymous semua route admin/private download, dan CSRF upload pada 360×800 dan 1280×900. Run cloud memakai Chromium sistem `/usr/bin/chromium`. CI memasang Chromium Playwright dan mengaktifkan `PLAYWRIGHT_USE_BUNDLED=1`; mesin lain dapat memasang browser bundled atau set `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH`.

CI `.github/workflows/ci.yml` menjalankan frozen install, lint, typecheck, tests, build dan smoke E2E. Keberhasilan CI GitHub sendiri harus dibaca dari run remote; hasil lokal tidak otomatis berarti remote CI lulus.

## Hasil aktual pada 24 Oktober 2026 (WIB)

- Lint, TypeScript dan production build lokal lulus.
- 28 tes unit/komponen/database dan 8 smoke browser lulus (lihat laporan Sprint 1 untuk hasil final setelah perubahan).
- Upaya Supabase lokal gagal saat pull image: registry `public.ecr.aws` menghasilkan Forbidden, fallback beberapa image resmi GHCR berhasil, tetapi ekstraksi image Postgres `17.11.0.006` gagal `no space left on device` pada daemon VFS. Proses start milik tugas dihentikan; tidak mengganti storage driver atau menghapus resource lain. Tidak ada stack Supabase aktif.
- `npm run db:reset`, bootstrap Auth, login admin sungguhan, upload/preview Storage HTTP, brand update dari UI tanpa deploy, dan authoring/publish dari HP dengan backend penuh belum dijalankan. S1-02 dan acceptance end-to-end tetap terbuka.

Setelah backend tersedia, jalankan migration staging MASHURA dan bootstrap akun sah, lalu uji: non-admin ditolak UI/API; ubah nama/logo dan cek public header/title; buat kategori; buat LMS dan PDF privat dari HP; publish lengkap, tolak publish belum lengkap; draft tidak publik; upload/preview file, archive/replace; duplikasi/nonaktif; ubah harga dengan alasan dan cek audit. Jalankan tes dua akun member terhadap HTTP Data API/Storage, tidak hanya policy engine terisolasi. Baru setelah bukti ini Sprint 1 dapat dinyatakan selesai penuh.

## Guard isolasi layanan

Koneksi remote ditolak sebelum `MASHURA_SUPABASE_PROJECT_REF` disetel dan cocok persis dengan hostname URL Supabase. Tanpa pin, aplikasi tidak memakai URL/key yang mungkin diwarisi dari konfigurasi deployment lain. Backend lokal hanya menerima localhost/127.0.0.1 port 54321. Ini mencegah koneksi tidak sengaja sebelum target PROYEK MASHURA diverifikasi; bukan pengganti verifikasi identitas project lewat API. Jangan mengisi pin dari resource BADAI.
