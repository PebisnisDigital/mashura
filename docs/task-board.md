# Roadmap dan task board Sprint 0–5

Baseline [PRD](PRD.md). Sprint 1 telah diotorisasi dan diimplementasikan lokal; integrasi/penerimaan backend penuh masih terbuka. Sprint 2–5 **belum dimulai**. Lihat [laporan Sprint 1](sprint-1-report.md). Urutan mengikuti PRD; durasi kalender tidak diada-adakan sebelum kapasitas disepakati. Persetujuan pengguna diperlukan untuk berpindah dari Sprint 0. Pembuatan akun/resource membutuhkan keputusan owner dan biaya tersendiri.

## Sprint 0 — audit dan rencana (selesai)

- [x] Baca seluruh PRD dan simpan salinan identik.
- [x] Audit kondisi awal repository dan akses baca GitHub.
- [x] Petakan kebutuhan, batas MVP dan keputusan terbuka.
- [x] Susun arsitektur, schema konseptual, state machine dan kontrol keamanan.
- [x] Susun backlog Sprint 1–5 dan checklist 15 acceptance criteria.
- [x] Persetujuan pemilik atas hasil Sprint 0 dan mulai Sprint 1.
- [x] Klarifikasi terakhir: akun teknis Vini; target existing Supabase PROYEK MASHURA dan Vercel mashura.vercel.app. Plugin/resource ID belum terverifikasi; provisioning belum dilakukan.

GitHub `PebisnisDigital/mashura` adalah target yang sudah diberikan pengguna, bukan project baru. Owner legal source code dan billing tidak dianggap selesai hanya karena repo tersedia. Dokumen ini merupakan serah-terima perencanaan; keputusan operasional belum disetujui tetap tercatat pada [register keputusan](decisions-and-operations.md).

## Sprint 1 — fondasi dan admin katalog

**Prasyarat:** persetujuan Sprint 1; owner, akun target, akses dan biaya disepakati sebelum pembuatan resource. Tidak memakai BADAI.

- [x] S1-01 Scaffold Next.js App Router + strict TypeScript, pin Node/package manager, lockfile, lint/typecheck/unit/build dan CI.
- [ ] S1-02 Siapkan lingkungan MASHURA yang disetujui; Supabase Auth, Storage, migration awal, RLS, role bootstrap; Vercel preview terpisah production bila sudah diotorisasi.
- [x] S1-03 Shell admin HP lima tab + sidebar desktop; auth/capability server dan tes non-admin.
- [x] S1-04 Branding/settings, logo/favicon, banner/urutan, warna, kontak, FAQ/legal; invalidasi cache tampilan publik dasar.
- [x] S1-05 Kategori dan CRUD/duplikasi produk; slug, harga/histori, galeri, FAQ, durasi, status draft/publish/unpublish, unggulan.
- [x] S1-06 Authoring enam tipe produk: LMS bab/pelajaran/video sah, PDF, file/template, prompt, external link, bundle. Upload privat, preview, validasi publish; belum delivery pembeli penuh.
- [x] S1-07 Audit perubahan kritis dan kebijakan penggantian file aman.

**Status implementasi:** checkbox S1 di atas menandai kode tersedia, bukan penerimaan E2E selesai. S1-02 dan uji Auth/Storage/backend penuh belum tuntas; Sprint 1 belum selesai penuh.

**Keluar:** AC01–03, AC13 bagian admin/storage awal, AC14 bagian katalog; admin dari HP menerbitkan satu produk lengkap, authoring satu LMS dan satu PDF; brand berubah tanpa deploy; non-admin dan anon gagal mutasi langsung. Lint/typecheck/unit/SQL-RLS/build lulus. Pengujian ini belum membuktikan pembayaran atau membership.

## Sprint 2 — toko publik

**Prasyarat:** katalog published dan policy aman Sprint 1.

- [ ] S2-01 Beranda, banner, kategori, unggulan/terbaru, pencarian, grid dua kolom HP.
- [ ] S2-02 Detail galeri, manfaat, isi/format, masa akses, FAQ, harga/promo sah dan produk terkait dasar sebagaimana PRD §10.
- [ ] S2-03 CTA Beli Sekarang tanpa cart; Buka Produk saat grant aktif nanti tersedia.
- [ ] S2-04 Model/UI ulasan pembeli terverifikasi; tanpa paid fixture sah tampil empty state, bukan review fiktif. Eligibility pembayaran diaktifkan dan diuji setelah Sprint 3–4.
- [ ] S2-05 Loading/empty/error, keyboard/fokus/kontras, sanitasi konten, metadata branding dinamis.

**Keluar:** AC02, AC04 aspek navigasi, UX01–03; draft dan materi privat tidak ada di HTML/query publik. Pencarian/kategori/detail bekerja mobile. REV01 eligibility end-to-end tetap pending sampai pembayaran/claim tersedia.

## Sprint 3 — checkout dan pembayaran

**Prasyarat:** provider/metode dipilih, sandbox tersedia, signature/status/expiry didokumentasikan; refund policy yang ditampilkan pembeli ditetapkan, termasuk prosedur manual aman bila otomasi rinci belum final. Tidak melakukan transaksi produksi.

- [ ] S3-01 Checkout tamu satu SKU, validasi nama/email/WA, total server, snapshot produk/harga/aturan, invoice privat.
- [ ] S3-02 Adapter gateway sandbox, instruksi/metode/expiry/status invoice, timeout dan retry request provider.
- [ ] S3-03 Webhook signature+verifikasi, event inbox, dedup, transisi status/konkurensi, invoice retry historis, paid ganda ke review.
- [ ] S3-04 Transaksi atomik paid → grant (belum claimed) + accrual komisi inti Rp10000 + audit + outbox. Ledger inti tidak ditunda ke Sprint 5 karena acceptance idempotensi.
- [ ] S3-05 Rekonsiliasi pembayaran dan pemulihan efek yang gagal; order admin tab/filter, bukti gateway tersanitasi dan status pemberian grant.
- [ ] S3-06 Uji sandbox sukses/gagal/expired/duplikat/terlambat/amount salah/environment salah/konkurensi. Pembayaran test tidak accrual produksi; fixture eligibility komisi sah terisolasi menguji aturan non-test.

**Keluar:** AC04–08, PAY01–05; sepuluh replay memberi tepat satu accrual dan satu grant per item, bundle accrual tetap satu. Invoice expired tidak direaktivasi retry. Tidak mengklaim pembeli bisa membuka materi sebelum Sprint 4.

## Sprint 4 — membership dan delivery

**Prasyarat:** provider email/Auth dipilih; domain/redirect aman; aturan mulai durasi/bundle dan prosedur koreksi email dikonfirmasi.

- [ ] S4-01 OTP/magic link, verified-email claim idempoten, session aman, resend generik, expired link.
- [ ] S4-02 Koleksi Saya dan pesanan sendiri; produk kedua menambah koleksi, expired/revoked state, CTA Buka Produk.
- [ ] S4-03 Reader LMS, PDF/file, prompt dan external link terlindungi; signed download; materi baru/penggantian file aman.
- [ ] S4-04 Bundle snapshot, masa berlaku dan multiple independent grants; uji batas UTC/WIB.
- [ ] S4-05 Admin member cari, tanggal expiry, resend, grant/revoke dengan alasan; tanpa revenue/komisi grant gratis.
- [ ] S4-06 Lengkapi verifikasi review berdasarkan order terbayar; tes negatif dua member, anonymous dan technical admin.

**Keluar:** AC09–11, AC13 penuh, AUTH/CONTENT/ENT/REV; alur lihat → bayar sandbox → verifikasi email → akses berhasil. Email berbeda/typo tidak mengambil alih order; signed URL tidak bisa diterbitkan akun lain.

## Sprint 5 — finance, QA dan persiapan peluncuran

**Prasyarat:** kebijakan refund/komisi, pembiayaan, payout period, domain/legal dan akses produksi disepakati. Persetujuan deploy/live diperlukan sesuai instruksi pengguna yang berlaku saat itu; Sprint 0 tidak mengotorisasi peluncuran.

- [ ] S5-01 Refund terverifikasi, adjustment ledger, revoke sumber terkait sesuai policy; refund parsial/dispute mengikuti keputusan tertulis.
- [ ] S5-02 Laporan gross/refund/net/komisi, status honor unpaid/paid, payout/offset; view Firdi dan Vini dari ledger sama; rentang tanggal WIB.
- [ ] S5-03 CSV aman, audit payout/refund, rekonsiliasi transaksi gateway/order/grant/ledger.
- [ ] S5-04 Ringkasan admin transaksi, omzet kotor, pending, produk aktif, anomali; filter/paginasi desktop dan HP.
- [ ] S5-05 Uji keseluruhan 15 AC, lint/typecheck/unit/integration/SQL-RLS/E2E/build, perangkat HP kecil, deny-path dan replay konkurensi.
- [ ] S5-06 Monitoring tanpa PII, backup database+Storage, restore drill staging, migrasi/rollback, credential rotation, kuota dan biaya.
- [ ] S5-07 Runbook support email typo, materi hilang, payment mismatch, resend dan rekonsiliasi honor; legal/customer support diverifikasi.
- [ ] S5-08 Setelah gerbang rilis dan persetujuan: konfigurasi production terpisah, deployment, smoke test alur live terkontrol dan rekonsiliasi.

**Keluar:** AC12, AC14–15 dan regresi semua AC; tidak ada bug kritis auth/payment/data; keputusan operasional tuntas; restore dan rekonsiliasi terbukti. Build sukses saja tidak berarti siap produksi.

## Definition of done setiap sprint implementasi

Perubahan mengikuti PRD dan memiliki migration/constraint/policy bersama schema, test positif dan negatif relevan, dokumentasi konfigurasi tanpa secret, bukti command/hasil tes dan review risiko. Tidak menyamakan skipped/unrun dengan pass. Perubahan scope memerlukan persetujuan; blocker provider/credential tidak ditutupi fixture palsu. Laporkan hasil lalu ikuti batas persetujuan pengguna untuk sprint berikutnya.
