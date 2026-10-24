# Strategi validasi dan checklist pengujian

Status Sprint 0: hanya pemeriksaan dokumen; **semua tes aplikasi di bawah belum dijalankan**. Belum ada runtime aplikasi, SQL migration atau resource remote. Checklist kosong berarti rencana, bukan lulus. Bukti saat implementasi harus mencatat command, commit, lingkungan, fixture, expected/actual, jumlah passed/failed/skipped dan artifact run saat ini.

## Pemetaan lengkap acceptance criteria PRD §11

| ID | Skenario dan hasil wajib | Lapisan / sprint |
|---|---|---|
| AC01 | Admin ubah nama/logo; header dan title berubah tanpa redeploy, nama resource mashura tetap | E2E + cache / 1 |
| AC02 | Produk belum lengkap tetap draft; publik/search/direct API tidak melihat; publish valid tampil | Unit publish + RLS + E2E / 1–2 |
| AC03 | Admin authoring satu LMS dan PDF privat dari HP; non-owner tidak membaca materi/file | E2E + storage / 1,4 |
| AC04 | Tidak ada cart route/state/CTA; server tolak array SKU/quantity >1; bundle satu SKU sah | Route audit + integration / 2–3 |
| AC05 | Checkout snapshot harga; edit harga admin tidak mengubah order, jumlah/history/report lama | Integration DB / 3 |
| AC06 | Redirect sukses, tombol sudah bayar dan screenshot tidak bisa menandai paid/grant/accrual | Negative API + E2E / 3 |
| AC07 | 10 replay paid yang sama berurutan dan paralel; satu accrual; satu grant per item, bukan duplikasi | Integration DB + provider sandbox / 3 |
| AC08 | Invoice A expired; retry B paid; A tetap expired, B accepted; satu accrual/grant; event A terlambat masuk review | Integration + E2E / 3 |
| AC09 | Verified member beli A lalu B; keduanya ada; akun berbeda ditolak, unclaimed order tak bocor | Auth + RLS + E2E / 4 |
| AC10 | Bundle paid membuka semua child snapshot; komisi 10000 satu kali, bukan per child; child baru tidak ditambahkan diam-diam | Integration + E2E / 3–4 |
| AC11 | Manual grant gratis beralasan membuka akses, audit ada; revenue/payment/accrual tidak tercipta; revoke hanya sumber terkait | Integration + E2E / 4 |
| AC12 | Refund terkonfirmasi menambah adjustment tanpa menghapus histori; revoke sesuai policy; refund replay aman | Integration + E2E / 5 |
| AC13 | Anon tidak admin/storage; member A tidak orders/profile/grant/file B lewat UI, REST/RPC maupun endpoint | SQL/RLS + API + E2E / 1,4–5 |
| AC14 | Admin tambah produk dan pantau pesanan di 320/360px; kontrol utama tidak terpotong; desktop sidebar setara | E2E viewport + uji HP nyata / 1,5 |
| AC15 | Firdi/Vini mendapat total ledger sama, invoice bisa direkonsiliasi; CSV dan payout sesuai 10000/transaksi sah | Integration finance + CSV + E2E / 5 |

## Skenario turunan yang harus dicentang saat diuji

### Pembayaran dan finansial

- [ ] PAY01: Nama/email/WA invalid ditolak server; total/fee/currency/product status tidak dari klien; token invoice salah/expired dan nomor invoice ditebak tidak membuka PII.
- [ ] PAY02: Gateway sandbox success/failed/expired; signature salah, body diubah, merchant/nominal/currency/environment salah tidak memberi efek; event tidak dikenal tercatat aman.
- [ ] PAY03: paid→pending/expired tidak menurunkan status; paid terlambat invoice expired ke review; dua payment/invoice satu group hanya satu accepted order; uang kedua tetap terekam untuk resolusi.
- [ ] PAY04: Putus koneksi sesudah provider create sebelum respons; retry lookup/idempotency tidak menggandakan charge; rollback DB tengah grant/accrual pulih konsisten saat replay.
- [ ] PAY05: Event received belum processed tetap diproses retry; email failure sesudah commit tidak mengubah paid; outbox di-retry tanpa kehilangan instruksi login.
- [ ] FIN01: Pending/failed/expired/test/manual gratis/duplikat tak accrual; penjualan sah 10000; bundle satu; bruto/fee/refund tidak tercampur.
- [ ] FIN02: Refund sebelum/sesudah payout, dua request paralel, full/replay dan partial sesuai policy final; saldo/alokasi tidak bisa melampaui outstanding; histori immutable.
- [ ] FIN03: Rentang tanggal WIB termasuk transaksi dekat pergantian hari; unpaid/paid konsisten Firdi/Vini; formula CSV `= + - @`, koma/newline/Unicode aman; PII tersamarkan Vini.

### Identitas, akses dan konten

- [ ] AUTH01: Checkout tamu tidak memberi session; hanya email Auth verified cocok yang boleh claim; email input/user_id palsu dan user_metadata admin tidak berpengaruh.
- [ ] AUTH02: Magic link/OTP invalid, expired, replay; redirect URL tak diizinkan ditolak; resend rate-limited dengan pesan generik; logout/session expiry menutup akses.
- [ ] AUTH03: Email berbeda, typo, alias plus/dots tidak salah digabung; koreksi manual memerlukan verifikasi, audit dan tidak mengklaim order milik orang lain.
- [ ] ENT01: 30/365 hari dan available; tepat pada expires_at ditolak; UTC/WIB benar; grant belum mulai/revoked ditolak; signed URL baru tidak diterbitkan setelah expiry.
- [ ] ENT02: Dua sumber hak produk sama; refund satu sumber tidak mencabut grant sah lain; claim paralel tidak menggandakan/mencuri grant.
- [ ] ENT03: Unpublish menghentikan penjualan tanpa menghapus akses pembeli aktif; materi baru published dapat diakses; policy layanan unavailable dijelaskan, bukan revoke diam-diam.
- [ ] CONTENT01: LMS urutan bab/pelajaran, video embed sah, teks dan lampiran hanya untuk pemilik; URL tidak membocorkan konten publik.
- [ ] CONTENT02: PDF/template/prompt/file valid; path menebak milik orang lain, object listing, signed URL palsu ditolak; TTL URL benar dan batas revoke selama TTL dijelaskan.
- [ ] CONTENT03: File hilang memberi error/dukungan yang jelas; penggantian tidak memutus referensi lama tanpa peringatan/prosedur; upload type/size/path berbahaya ditolak.
- [ ] CONTENT04: External link tersembunyi dari non-owner; tidak menjanjikan pembuatan lisensi SaaS; bundle snapshot dan durasi sesuai keputusan tertulis.
- [ ] REV01: Hanya verified paid buyer produk terkait dapat menulis review; anon/grant gratis/akun lain ditolak; refund mengikuti label eligibility yang disepakati; tanpa review tampil empty state.

### Admin, UX dan keamanan

- [ ] ADM01: Tab order Semua/Belum Bayar/Lunas/Expired/Refund, cari invoice/email/WA, filter/paginasi, status grant/gateway, ringkasan admin cocok data; Vini hanya laporan terotorisasi.
- [ ] UX01: Grid dua kolom HP, tombol sentuh, navigasi lima tab/desktop; loading/empty/error/success, fokus, label dan kontras; tidak meniru aset merek pihak lain.
- [ ] UX02: Draft/preview/inactive, banner/unggulan/urutan, harga coret beralasan; tidak ada fake sales/review/urgency; CTA pemilik aktif Buka Produk.
- [ ] UX03: Form authoring lengkap/duplikasi/slug/kategori/FAQ, minimal LMS+PDF; resize HP ke desktop mempertahankan operasi yang dapat dipakai.
- [ ] SEC01: Matriks role diuji melalui akses langsung Data API/RPC, bukan UI saja; helper policy tidak rekursif; role revoked segera ditolak.
- [ ] SEC02: Anon tidak menulis settings/roles/materials/orders/payment/ledger/audit; member tak bisa mengubah nominal/member_id/expiry/status; service key tak ada di output browser.
- [ ] SEC03: Mutasi lintas origin, rich text/script/URL aktif, path traversal/SSRF, upload aktif dan payload besar ditolak; error/log tidak membocorkan data rahasia.
- [ ] SEC04: Cache CDN/browser tidak membagikan invoice/PII/grant/signed URL antar akun; katalog publik tidak memuat body prompt/link privat.
- [ ] SEC05: Audit harga/role/manual access/koreksi email/refund/payout berisi aktor/alasan/waktu, tidak bisa dihapus; secret scan repository dan artifact build.
- [ ] SEC06: Preview/sandbox tidak terhubung resource/live credential produksi atau BADAI; signature/payment environment isolation terbukti.
- [ ] OPS01: Backup database dan object Storage dipulihkan ke staging MASHURA; order/grant/ledger/asset reference utuh; RPO/RTO disepakati dan dibanding hasil drill.
- [ ] OPS02: Rehearsal migration, app rollback, pending event replay dan credential rotation; replay tidak menggandakan efek.
- [ ] OPS03: Email deliverability, halaman legal/refund/privasi, support, kuota/bandwidth/monitoring alert dan rekonsiliasi harian sesuai keputusan operasi diperiksa sebelum go-live.

## Alat dan urutan eksekusi (rencana)

Usulan Vitest untuk unit/integrasi domain, Supabase local + SQL/pgTAP untuk RLS/constraint, Playwright untuk E2E. Pin versi/commands saat Sprint 1; belum ada `npm test` yang dapat dieksekusi. Unit memakai clock dan adapter provider terkontrol; integration menggunakan database sungguhan terisolasi dan transaksi paralel. Sandbox provider membuktikan integrasi, bukan digantikan unit mock.

CI: install frozen → lint/typecheck → unit → migration+SQL/RLS → integration → build → E2E sesuai komponen tersedia. Service-dependent test yang tidak tersedia dilaporkan unrun/blocked; tidak dibuat no-op pass. Fixture minimal: anonymous, member A/B, business admin, technical admin, tamu, draft/published enam tipe produk, order sah/test/failed/expired/refund dan grant terpisah. Tidak menyalin PII atau credential produksi.

## Validasi Sprint 0

Pemeriksaan yang tersedia sekarang: kesamaan byte PRD unggahan/salinan, kelengkapan file dan link Markdown lokal, pemetaan AC01–AC15, whitespace diff, serta scope diff hanya dokumentasi. RLS, gateway, Auth, lint/typecheck/build, E2E, restore dan deploy **belum dijalankan** karena implementasinya tidak termasuk Sprint 0. Hasil aktual dicatat di [register operasional](decisions-and-operations.md).
