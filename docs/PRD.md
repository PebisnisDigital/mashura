# PRODUCT REQUIREMENTS DOCUMENT (PRD)

# MASHURA — Toko Produk Digital & Membership

**Versi:** 1.0 — baseline pembangunan MVP  
**Tanggal:** 24 Oktober 2026 (WIB)  
**Status:** Disepakati untuk mulai pengembangan bertahap; keputusan operasional yang belum dipilih tercatat pada Bagian 15.  
**Nama proyek teknis:** `mashura` untuk GitHub, Vercel, dan Supabase.  
**Nama toko saat awal:** MASHURA (bisa diubah admin).  
**Pemilik/operasional usaha:** Firdi.  
**Pengembang/mitra komisi:** Teh Vini.  
**Harga produk sasaran:** Rp50.000–Rp200.000 per produk.

> **Aturan utama:** Identitas *proyek teknis* tetap `mashura`, sedangkan **nama toko, logo, favicon, deskripsi, warna aksen, banner, dan kontak toko dapat diubah dari halaman admin**. Mengganti nama toko tidak mengganti nama repository, Supabase project, Vercel project, atau domain secara otomatis.

## 1. Ringkasan produk

MASHURA adalah **satu toko milik Firdi**, bukan marketplace multi-seller. Produk yang dijual adalah produk digital, dengan pengalaman menjelajah yang familiar bagi pembeli marketplace Indonesia: pencarian, kategori, kartu produk, detail produk, checkout cepat, pesanan, dan ulasan yang benar-benar berasal dari pembeli.

Tampilan admin mengikuti *pola perilaku* Seller Centre: ringkasan bisnis, daftar produk, status pesanan, member, dan keuangan. Produk dan visual tidak meniru merek, logo, ikon proprietary, ataupun layout persis milik Shopee.

Tidak ada keranjang belanja. Setiap transaksi membeli **satu SKU/produk**, termasuk apabila SKU tersebut adalah paket bundling.

## 2. Tujuan dan ukuran keberhasilan MVP

### Tujuan

1. Firdi dapat mengoperasikan toko dan mengunggah produk dari HP tanpa menulis kode.
2. Pembeli bisa menemukan, membayar, dan mengakses produk digital tanpa bantuan admin dalam alur normal.
3. Setiap produk yang dibeli muncul dalam satu akun member yang sama, sesuai hak aksesnya.
4. Firdi dan Teh Vini bisa mengaudit transaksi dan komisi Rp10.000 dengan data yang sama.
5. Sistem memisahkan data dan akun MASHURA dari BADAI dan bisnis lainnya.

### Kriteria kesuksesan sebelum rilis

- Admin dapat menerbitkan produk digital contoh melalui dashboard HP.
- Pembeli berhasil melewati alur **lihat produk → beli → bayar → verifikasi akun → akses materi**.
- Pembayaran gagal/kedaluwarsa tidak memberikan akses atau komisi.
- Pembelian kedua oleh akun yang sama menambah produk ke Koleksi Saya tanpa menghapus produk sebelumnya.
- Semua route admin, file berbayar, dan data pesanan terlindungi izin akses.
- Laporan penjualan dan ledger honor konsisten dengan transaksi gateway.

## 3. Personas dan hak akses

| Aktor | Tujuan | Hak akses |
|---|---|---|
| **Pengunjung** | Mencari produk dan membeli | Melihat produk terbit; checkout sebagai tamu |
| **Member/pembeli** | Mengakses semua produk yang sah dibeli | Profil, histori pesanan sendiri, Koleksi Saya, materi yang berhak diakses |
| **Admin bisnis (Firdi)** | Mengelola toko sehari-hari | Kelola identitas toko, produk, materi, pesanan, akses member, promosi dasar, laporan |
| **Admin teknis (Vini)** | Memelihara aplikasi dan memverifikasi honor | Akses teknis terbatas sesuai kebutuhan; dapat membaca laporan transaksi dan ledger komisi; perubahan kritis tercatat |

Hak admin tidak boleh hanya ditentukan oleh menu frontend yang tersembunyi. Verifikasi role/otorisasi wajib diterapkan di server dan kebijakan Supabase.

## 4. Ruang lingkup fitur MVP

### A. Toko publik

- Header: logo/nama toko dinamis, pencarian, navigasi kategori, masuk/akun.
- Beranda: banner yang diatur admin, kategori, produk unggulan, produk terbaru.
- Daftar kategori dan hasil pencarian: grid kartu produk dua kolom pada HP.
- Detail produk: galeri gambar, judul, harga, ringkasan manfaat, apa yang didapat, deskripsi lengkap, format produk, akses/masa berlaku, FAQ, ulasan terverifikasi bila tersedia.
- CTA utama **Beli Sekarang**, langsung ke checkout; jika sudah dimiliki akun yang login, utamakan **Buka Produk**.
- Produk yang masih draft/nonaktif tidak muncul di toko maupun pencarian publik.
- Harga dan diskon transparan; harga coret hanya apabila riwayat harga/promo sah dan dapat dibuktikan.
- Tidak ada stok fisik, ongkir, alamat pengiriman, kurir, atau keranjang belanja.

### B. Checkout

- Checkout satu SKU, termasuk bundle sebagai satu SKU.
- Form minimal: nama, email, nomor WhatsApp; validasi server, normalisasi email/nomor telepon.
- Boleh checkout sebagai tamu, tidak wajib membuat password sebelum pembayaran.
- Ringkasan nama produk, harga, biaya tambahan bila ada, jumlah akhir, dan metode bayar.
- Metode pada MVP: QRIS dan/atau transfer/virtual account **jika didukung provider terpilih**.
- Invoice memiliki ID unik dan status: `pending`, `paid`, `expired`, `failed`, `refunded` (status penyelesaian rinci dapat mengikuti provider).
- Halaman invoice memperlihatkan instruksi pembayaran, batas waktu sesuai provider, dan status terbaru.
- Sistem menerima webhook pembayaran, **memverifikasi keaslian dan statusnya di server**, serta mengeksekusi efek pembayaran **tepat satu kali secara idempoten**.
- Browser redirect/screenshot bukti transfer tidak cukup untuk menandai pesanan `paid`.
- Retry pembayaran membuat invoice/pembayaran baru dengan relasi historis; invoice kedaluwarsa tidak pernah tiba-tiba mendapat akses dari transaksi baru.
- Pembayaran ganda/salah status masuk proses pemeriksaan dan tidak menciptakan entitlement atau komisi ganda.

### C. Membership dan materi

- Satu identitas member dengan email terverifikasi; akses awal lewat email magic link/OTP atau mekanisme aman yang dipilih saat implementasi.
- Pembelian tamu ditautkan ke akun hanya setelah kepemilikan email berhasil diverifikasi.
- Halaman **Koleksi Saya** berisi semua hak akses produk yang sah, status aktif/kedaluwarsa, dan tombol buka.
- Akses produk dibuat berdasarkan **entitlement/hak akses**, tidak sekadar memeriksa ada baris pesanan.
- Jenis produk:
  1. **Kursus/LMS:** modul/bab, urutan materi, video tertanam dari penyedia sah, teks, lampiran.
  2. **Ebook/PDF:** baca/unduh file privat sesuai aturan akses.
  3. **Template/File:** file privat yang didapat sesuai entitlement.
  4. **Prompt digital:** isi teks atau dokumen terproteksi.
  5. **Akses tautan eksternal:** tautan/instruksi yang ditampilkan hanya kepada member yang berhak; pembuatan akun/lisensi pada SaaS luar tidak dianggap otomatis tanpa API/integrasi.
  6. **Bundle:** satu SKU yang membuka sejumlah produk anak sesuai konfigurasi paket.
- Durasi akses per produk: selama produk dan layanan tersedia, 365 hari, atau 30 hari; dapat diperluas setelah versi pertama.
- File berbayar disimpan privat dan hanya dibuka dengan otorisasi dan URL berbatas waktu atau proxy yang aman; URL publik permanen tidak boleh digunakan untuk file privat.
- Konten pelajaran baru yang diterbitkan menjadi tersedia bagi member yang entitlement-nya masih aktif.
- Penggantian konten tidak mengubah nilai transaksi yang sudah terjadi.
- Untuk refund, kebijakan pencabutan hak akses ditentukan berdasarkan aturan bisnis yang ditampilkan saat pembelian, dengan aksi dan alasan tercatat.

### D. Dashboard admin — mobile first

**Navigasi HP:** `Beranda | Pesanan | Produk | Keuangan | Lainnya`.  
**Navigasi desktop:** sidebar dengan modul identik, tabel lebih luas, pencarian dan filter.

1. **Beranda:** ringkasan transaksi, omzet kotor, pesanan menunggu bayar, produk aktif, tindakan yang perlu perhatian.
2. **Produk:** daftar/filter produk, tambah baru, edit, duplikasi, draft, publish/unpublish, kategori, thumbnail/galeri, harga, deskripsi, FAQ, aturan akses, materi, bundle.
3. **Pesanan:** tab Semua/Belum Bayar/Lunas/Expired/Refund, pencarian invoice/email/WA, detail harga dan bukti status gateway, status pemberian akses.
4. **Member:** cari member; produk yang dimiliki; tanggal kedaluwarsa; kirim ulang instruksi login; grant/revoke akses manual dengan alasan dan audit log. Grant gratis bukan transaksi berkomisi.
5. **Keuangan:** transaksi lunas, refund, gross sales, komisi, dan status pembayaran honor.
6. **Pengaturan toko:** nama toko, logo, favicon, aksen warna, banner, deskripsi toko, kontak dukungan, FAQ umum, teks legal, pengaturan halaman publik.
7. **Promosi dasar:** pilih produk unggulan dan urutan banner; fitur voucher kompleks bukan MVP.

### E. Proses admin menambah produk

1. **Informasi:** judul, slug otomatis yang dapat diedit, kategori, harga, cover, galeri.
2. **Deskripsi:** ringkasan, penjelasan lengkap, apa yang diterima, persyaratan perangkat/akun, FAQ.
3. **Materi/Akses:** pilih tipe produk; unggah PDF/file privat, input materi LMS, masukkan tautan eksternal aman, atau pilih produk anak untuk bundle.
4. **Aturan:** durasi akses, visibilitas, ketentuan penggunaan.
5. **Preview & Publish:** tampilkan detail seperti pembeli; validasi item wajib; status `draft` bila belum lengkap.

Setelah publish, admin dapat menambah materi tanpa membuka akses bagi pengguna yang belum membeli. Tidak boleh menghapus file yang masih dibutuhkan pembeli tanpa peringatan dan prosedur penggantian.

## 5. Alur end-to-end pembeli

1. Buka beranda MASHURA, cari berdasarkan kategori atau kata kunci.
2. Buka detail produk, cek isi produk, harga, dan durasi akses.
3. Klik **Beli Sekarang** (tidak ada keranjang).
4. Isi identitas, konfirmasi invoice, pilih metode pembayaran.
5. Bayar. Status `pending` sampai validasi gateway menyatakan `paid`.
6. Setelah `paid`, entitlement diterbitkan satu kali; pembeli menerima informasi untuk masuk/mengklaim akun.
7. Pembeli memverifikasi email, login, lalu melihat **Koleksi Saya** dan membuka produk.
8. Jika membeli produk lain, hak akses baru ditambahkan ke akun terverifikasi yang sama.

**Edge cases wajib:** invoice expired; QRIS lama expired lalu dibuat invoice baru; webhook berulang/terlambat; email berbeda; pengguna salah ketik email; refund; akses habis; materi tak ditemukan; tautan login kedaluwarsa; pengguna mencoba membuka file orang lain.

## 6. Aturan komisi kerja sama

- Nilai honor dasar Teh Vini: **Rp10.000 per satu transaksi produk/SKU yang sah dan lunas**. Transaksi bundle tetap satu transaksi.
- Honor tidak timbul dari invoice `pending`, `expired`, `failed`, akses manual gratis, pesanan uji, atau duplikasi webhook.
- Jika pembayaran di-refund, hak honor terkait harus dibatalkan atau dikompensasikan melalui entri penyesuaian ledger. Jangan menghapus jejak historis.
- Ledger menyimpan ID transaksi, waktu lunas, harga bruto, honor, adjustment, status pembayaran honor, tanggal pencairan, serta catatan.
- Dashboard admin Firdi dan tampilan laporan khusus Vini menggunakan sumber data ledger yang sama; export CSV disediakan.
- Periode rekonsiliasi/pembayaran honor **belum disepakati**. Sistem disiapkan untuk rekap rentang tanggal dan status `unpaid`/`paid`; interval operasional dipilih sebelum go-live.
- Hak komisi untuk transaksi manual/kupon 100%/refund parsial dan pajak/biaya gateway perlu dituangkan dalam kesepakatan kerja sama sebelum transaksi produksi.

## 7. Arsitektur yang dituju

| Lapisan | Keputusan |
|---|---|
| Frontend & backend web | Next.js dengan TypeScript, desain mobile-first |
| Source control | Repository GitHub terpisah bernama `mashura` (owner organisasi belum ditetapkan) |
| Hosting | Project Vercel `mashura` — environment preview dan production terpisah |
| Database & Auth | Project Supabase `mashura` khusus, bukan basis data BADAI |
| Storage | Supabase Storage privat untuk dokumen kecil; media video besar di penyedia video yang sesuai |
| Pembayaran | Gateway Indonesia dengan QRIS dan metode tambahan, provider final menunggu pilihan |
| Email | Layanan pengiriman email transaksional/auth yang terukur, provider final saat integrasi |
| Admin toko | Pengaturan tersimpan di database, bukan hardcoded di source code |
| Tanggal/waktu | Simpan UTC di database; tampilkan WIB untuk admin/pembeli Indonesia |

### Nama teknis vs identitas toko

- Repository GitHub: `mashura`.
- Vercel project: `mashura`.
- Supabase project: `mashura`.
- Display name toko awal: `MASHURA`, disimpan pada `store_settings`.
- Logo awal boleh placeholder; admin bisa mengunggah logo sendiri, mengatur favicon dan warna aksen.
- Perubahan display name **tidak** otomatis memindahkan domain, endpoint webhook, nama project ataupun repository.

### Keamanan minimum

- Supabase RLS aktif pada semua tabel yang terpapar Data API; hak admin dan member dibatasi berdasarkan kepemilikan serta role server-side.
- Jangan mengambil role admin dari metadata pengguna yang bisa diedit sendiri.
- Kunci rahasia Supabase/service role, gateway, dan email hanya di server/environment rahasia.
- Akses unduhan harus mengecek entitlement setiap kali memberikan URL privat.
- Endpoint webhook memverifikasi asal/status pembayaran, mencatat event, menolak pemrosesan ganda, dan tidak boleh bergantung pada browser.
- Mutasi akses manual, perubahan harga, refund, serta perubahan status honor dicatat dalam audit log.
- Lindungi data pribadi (email, WhatsApp), batasi tampilan di laporan, dan sediakan kebijakan privasi serta syarat pembelian.
- Lakukan pengujian RLS negatif: member A tidak boleh melihat orders/file/member B; pengunjung tidak boleh menulis data admin.
- Tetapkan prosedur backup database, pemulihan, pengelolaan credential, dan migrasi SQL sebelum produksi.

**Catatan biaya/paket (24 Okt 2026):** Hosting komersial tidak dijalankan dengan Vercel Hobby karena pembatasan penggunaan non-komersial; gunakan Vercel Pro atau hosting yang mengizinkan komersial. Supabase Free berguna untuk awal, tetapi kuota/batas storage dan backup mesti dipantau sebelum live.

## 8. Entitas data konseptual

Nama tabel final akan ditetapkan pada rancangan database dan migration, tetapi relasi bisnis berikut wajib ada:

| Entitas | Tanggung jawab |
|---|---|
| `store_settings` | Nama/logo/tema/banner/kontak toko |
| `profiles` / `admin_roles` | Profil pengguna dan hak admin terotorisasi |
| `categories` | Kategori produk |
| `products` | SKU, nama, slug, harga, tipe, status, durasi akses |
| `product_media` | Thumbnail, galeri produk |
| `product_materials` | Bab LMS, dokumen, unduhan, tautan, urutan dan status materi |
| `bundle_items` | Relasi SKU bundle dengan produk yang dibuka |
| `orders` / `payments` | Snapshot harga saat transaksi, invoice, provider, status, histori |
| `payment_events` | Jejak webhook dan kunci idempotensi |
| `member_entitlements` | Produk mana yang boleh diakses member dan hingga kapan |
| `manual_access_events` | Pemberian/pencabutan manual beserta alasan dan aktor |
| `commission_ledger` | Honor Rp10.000 dan seluruh penyesuaian/payout |
| `audit_logs` | Perubahan kritis dan penanggung jawab |

Gunakan *snapshot* nama dan harga produk saat checkout agar perubahan harga di kemudian hari tidak mengubah laporan transaksi historis. Gunakan constraint unik yang sesuai untuk menjamin invoice/payment event/entitlement/commission tidak mengganda.

## 9. Aturan desain dan pengalaman

- Mobile-first, nyaman dipakai dari HP entry-level; tombol besar, form ringkas, kontras kuat.
- Pola perilaku familiar seperti marketplace, **bukan clone Shopee**.
- Admin HP menampilkan **bottom navigation** Beranda/Pesanan/Produk/Keuangan/Lainnya.
- Admin desktop menggunakan sidebar dan tabel dengan filter, urutkan, paginasi.
- Toko menggunakan komponen yang konsisten; branding final dapat disetel dari admin.
- Ada loading, empty state, success/error state, dan penjelasan sederhana untuk pembayaran/kepemilikan produk.
- Jangan menggunakan testimonial palsu, jumlah penjualan fiktif, atau urgency palsu.

## 10. Prioritas pengerjaan / sprint

### Sprint 0 — Dokumen dan fondasi keputusan

- Finalkan PRD ini sebagai baseline.
- Tetapkan pemilik GitHub/Vercel/Supabase/gateway/domain dan aturan pembiayaan.
- Buat `docs/architecture.md`, `docs/database.md`, `docs/task-board.md` saat mulai coding.
- Tentukan provider pembayaran dan kebijakan refund sebelum sprint pembayaran.

### Sprint 1 — Repo dan admin katalog

- Scaffold Next.js + TypeScript + lint/test.
- Siapkan project `mashura` dan environment, migration awal, Auth admin + RLS.
- Implementasikan identitas toko yang bisa diubah, sidebar/bottom nav admin, kategori, produk, materi, draft/publish, preview.
- Verifikasi: admin menambah **satu produk uji lengkap** dari HP; perubahan nama/logo toko terlihat di publik; non-admin tidak dapat melakukan mutasi.

### Sprint 2 — Toko publik

- Beranda, kategori, pencarian, detail produk, FAQ, produk terkait dasar.
- Verifikasi: produk terbit tampil, draft tersembunyi, tanpa keranjang, satu CTA Beli Sekarang.

### Sprint 3 — Checkout dan pembayaran

- Checkout tamu, invoice, provider sandbox, webhook validasi, idempotensi, status pembayaran, pemulihan dari expired.
- Verifikasi: bayar sukses, gagal, expired, webhook duplikat dan terlambat tidak menghasilkan efek ganda.

### Sprint 4 — Membership dan akses produk

- Login/claim email aman, Koleksi Saya, entitlement, LMS, unduhan privat, bundle, masa berlaku.
- Verifikasi: akses hanya untuk pemilik, transaksi kedua menambah koleksi, akun lain ditolak.

### Sprint 5 — Finance, QA, peluncuran

- Ledger honor, refund/adjustment, export CSV, audit log, pengaturan produksi, monitoring, backup, uji lintas perangkat.
- Verifikasi: laporan cocok dengan transaksi gateway dan hak akses; skenario bug kritis lulus.

## 11. Acceptance criteria wajib

1. **Pengaturan brand:** Admin mengganti nama `MASHURA` menjadi nama lain dan mengunggah logo; header toko & title terkait berubah tanpa deploy ulang atau mengubah nama proyek teknis.
2. **Produk draft:** Produk baru belum tampil publik sampai data wajib lengkap dan dipublish.
3. **Tipe konten:** Admin berhasil membuat minimal satu kursus LMS dan satu PDF privat dari dashboard.
4. **Tanpa keranjang:** Tidak ada tombol/route/cart state atau multi-SKU checkout.
5. **Harga:** Harga order tersimpan sebagai snapshot dan tidak berubah setelah admin mengedit harga produk.
6. **Payment:** Menekan “Saya Sudah Bayar” atau redirect sukses di browser tidak memberi akses sebelum verifikasi gateway.
7. **Idempotensi:** Sepuluh pengiriman ulang event `paid` yang sama tetap menghasilkan satu entitlement dan satu komisi.
8. **Expired lalu bayar ulang:** Invoice lama tetap historis expired; hanya invoice baru yang berhasil diverifikasi membuka produk dan mencatat satu komisi.
9. **Member:** Member yang membeli produk A dan B melihat keduanya di akun yang sama; member lain tidak bisa mengakses keduanya.
10. **Bundling:** Satu pembayaran bundle membuka child products yang dikonfigurasi, tapi komisi tetap satu kali Rp10.000.
11. **Manual grant:** Admin memberi akses gratis dengan alasan; penerima bisa masuk, tetapi tidak tercipta revenue atau komisi.
12. **Refund:** Ledger menunjukkan koreksi tanpa menghapus histori; aturan pencabutan entitlement diterapkan sesuai kebijakan yang diumumkan.
13. **Security:** Akses admin dan private storage ditolak untuk pengunjung; RLS diuji untuk setidaknya dua akun member yang berbeda.
14. **Mobile:** Admin dapat menambah produk dan memantau pesanan dari lebar viewport HP kecil; tidak ada tabel terpotong yang membuat tombol utama tak bisa digunakan.
15. **Export:** Admin dan Vini dapat merekonsiliasi daftar transaksi, invoice, dan Rp10.000/penjualan yang valid tanpa menghitung manual.

## 12. Di luar MVP (jangan dibangun dahulu)

- Marketplace multi-penjual dan pendaftaran seller mandiri.
- Keranjang belanja, ongkos kirim, tracking kurir, stok fisik.
- Affiliate publik/multi-level/referral kompleks.
- Sistem voucher bertingkat, flash sale, loyalty points.
- Chat internal marketplace, live streaming, gamifikasi.
- Aplikasi Android/iOS native.
- Otomasi pemberian lisensi pada produk pihak ketiga tanpa API resmi.
- Subscription/iuran bulanan berulang.
- AI penulis deskripsi otomatis dan laporan prediksi lanjutan.
- Integrasi WhatsApp otomatis yang berbayar atau membutuhkan template WABA (dapat ditambahkan sesudah alur inti stabil).

## 13. Risiko dan mitigasi

| Risiko | Mitigasi MVP |
|---|---|
| Pembayaran tercatat tetapi akses gagal | Event/entitlement tercatat atomik; proses rekonsiliasi ulang yang idempoten |
| Pembayaran berhasil ganda | Kunci unik event/payment dan ledger sekali per order sah |
| File digital bocor lewat URL publik | Private storage, authorization check, signed URL pendek |
| Email checkout salah ketik | Halaman status + cara menghubungi admin; prosedur perbaikan manual terverifikasi dan diaudit |
| Free tier kehabisan kuota | Pantau metrik, storage, bandwidth; media video jangan ditaruh di database/storage kecil |
| Penggantian nama toko membingungkan | Pisahkan identitas brand dari resource teknis dan domain |
| Perselisihan jumlah honor | Ledger immutable/adjustment, akses laporan kedua pihak, kebijakan hitung jelas |

## 14. Perjanjian operasional yang perlu ditandatangani

Dokumen PRD ini menjelaskan aplikasi, **bukan pengganti kontrak kerja sama**. Kesepakatan tertulis Vini–Firdi harus mencakup:

1. Definisi transaksi sah dan perlakuan refund/dispute.
2. Komisi Rp10.000 per transaksi, kapan jatuh tempo, dan mekanisme audit/pembayaran.
3. Biaya domain, hosting komersial, database, gateway, email, dan media.
4. Pemilik source code, akun layanan, data pelanggan, dan hak akses ketika kerja sama berakhir.
5. Tanggung jawab dukungan pelanggan, maintenance, dan keamanan data.

## 15. Konfigurasi/keputusan terbuka — tidak menghalangi Sprint 1

| Topik | Default kerja / status | Deadline keputusan |
|---|---|---|
| Nama proyek | `mashura` **final** | Sekarang |
| Nama dan logo toko | Awal `MASHURA`, admin bebas mengganti **final** | Sekarang |
| Provider gateway | Integrasi otomatis; provider belum dipilih | Sebelum Sprint 3 |
| Metode pembayaran aktual | QRIS/VA/transfer sesuai kemampuan provider | Sebelum Sprint 3 |
| Periode pembayaran honor | Sistem mendukung rentang bebas; jadwal mingguan/bulanan belum disepakati | Sebelum go-live |
| Refund & komisi | Refund mengoreksi ledger; detail refund parsial/dispute belum disepakati | Sebelum go-live |
| Pemilik akun teknis | Firdi disarankan pemilik bisnis & pembayaran; Vini akses pengembang | Sebelum membuat project remote |
| Domain produksi | Belum dipilih | Sebelum go-live |
| Warna/visual brand final | Placeholder netral; dapat diganti dari admin | Sebelum pemasaran |
| Email transaksional | Provider belum dipilih | Sebelum Sprint 4 |

## 16. Instruksi untuk Codex (aturan pengerjaan)

1. Baca PRD ini sepenuhnya; pecah pekerjaan menjadi checklist sprint dengan acceptance criteria.
2. Kerjakan **hanya sprint yang diminta**, jangan menambah fitur di luar MVP.
3. Jangan membuat proyek Supabase/Vercel/GitHub baru sebelum owner/akun target disepakati dan diperiksa.
4. Simpan migration database dalam git, gunakan TypeScript ketat, dan commit lockfile.
5. Pisahkan staging/sandbox pembayaran dari production; jangan menggunakan rahasia live di preview publik.
6. Jalankan lint, typecheck, unit/integration test relevan; untuk perubahan payment/auth/RLS tulis tes negatif dan idempotensi.
7. Laporkan file/fitur yang berubah, hasil tes, status deploy, masalah, dan pekerjaan berikutnya. Jangan mengklaim sistem siap produksi hanya karena build sukses.
8. Jangan meniru aset merek Shopee; gunakan hanya pola UX yang familier.

---

**Keputusan produk yang sudah dikunci:** MASHURA sebagai nama awal dan ketiga nama proyek teknis; brand bisa diedit admin; toko satu seller produk digital; tanpa keranjang; satu checkout = satu SKU; membership per-produk; dashboard admin nyaman di HP; komisi Vini Rp10.000 per penjualan valid.  
**Langkah berikutnya:** Sprint 0 mengunci kepemilikan akun, lalu Sprint 1: dashboard admin katalog dan branding dinamis.
