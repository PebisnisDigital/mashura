# Audit kebutuhan — Sprint 0

> Dokumen baseline Sprint 0. Status implementasi dan hasil validasi terkini: [laporan Sprint 1](sprint-1-report.md). Bagian yang menyebut belum ada kode/tes menggambarkan kondisi saat audit Sprint 0.

Tanggal: 24 Oktober 2026 (WIB). Baseline: [PRD v1.0](PRD.md), dibaca seluruh Bagian 1–16. Repo target yang diverifikasi: `PebisnisDigital/mashura`, commit awal `bcc6628f51898080ea14bf2392bff234bca10d07`, sama dengan remote `main` saat audit. Repo awal hanya memiliki README; belum ada implementasi, package manifest, lockfile, CI, migration, atau tes aplikasi.

## Batas pengerjaan

Sprint 0 menghasilkan dokumen saja. Tidak scaffold Next.js, memasang dependency aplikasi, membuat SQL executable, membuat layanan remote, mengakses BADAI, atau menjalankan pembayaran. PRD disimpan tanpa perubahan sebagai `docs/PRD.md`. Persetujuan Sprint 1 belum diberikan. Matriks berikut adalah cakupan yang direncanakan, bukan klaim fitur selesai.

## Matriks kebutuhan dan keterlacakan

| ID | Kebutuhan dan sumber PRD | Rencana implementasi | Sprint | Bukti penerimaan |
|---|---|---|---|---|
| R01 | Satu toko; nama teknis tetap; branding dinamis (§1,7,11.1) | Singleton pengaturan; metadata publik tersanitasi; cache invalidation | 1 | AC01 |
| R02 | Katalog admin HP; kategori, duplikasi, galeri, FAQ, preview, publish (§4D–E) | Workflow draft → validasi → published; harga/promo diaudit | 1 | AC02, AC03, AC14 |
| R03 | Beranda, unggulan/terbaru, banner berurutan, kategori, cari, detail, ulasan sah (§4A,9) | Query hanya produk terbit; grid 2 kolom HP; review pembeli terverifikasi | 2 | AC02, UX01, REV01 |
| R04 | Tanpa cart, satu SKU termasuk bundle (§1,4B,11.4) | Payload checkout satu product_id; quantity tetap satu | 2–3 | AC04 |
| R05 | Checkout tamu nama/email/WA; invoice/status/instruksi/masa berlaku (§4B,5) | Validasi server; nominal server; invoice privat dengan token acak | 3 | AC05, AC06, PAY01 |
| R06 | Gateway sah, webhook idempoten, retry, pembayaran ganda (§4B,5,13) | Adapter provider + event log + transaksi DB + rekonsiliasi | 3 | AC07, AC08, PAY02–05 |
| R07 | Email terverifikasi; claim tamu; koleksi kumulatif (§4C,5) | Auth OTP/magic link; klaim hanya setelah verified-email match | 4 | AC09, AUTH01–03 |
| R08 | LMS, PDF, template/file, prompt, external link, bundle (§4C) | Materi privat berurutan; child snapshot; durasi per sumber grant | 1 (authoring), 4 (delivery) | AC03, AC10, CONTENT01–04 |
| R09 | Entitlement, durasi 30/365 hari/selama layanan tersedia (§4C) | Grant per sumber; evaluasi aktif pada setiap akses; materi baru ikut hak aktif | 3 (penerbitan), 4 (akses) | AC07, ENT01–03 |
| R10 | Member admin; cari, resend login, grant/revoke dengan alasan (§4D) | Server-only mutation dan audit; grant gratis terpisah dari order | 4 | AC11 |
| R11 | Komisi Rp10.000 per SKU lunas sah, bundle satu; pengecualian (§6) | Satu accrual per order diterima; adjustment immutable | 3 (inti), 5 (laporan) | AC07, AC10–12, AC15 |
| R12 | Refund, honor unpaid/paid, payout, CSV bersama Firdi/Vini (§6,11) | Ledger + alokasi payout; filter tanggal; rekonsiliasi gateway | 5 | AC12, AC15, FIN01–03 |
| R13 | Dashboard pesanan/keuangan, filter invoice/email/WA, status akses (§4D) | Server query berotorisasi; bukti status gateway tersanitasi | 3–5 | ADM01 |
| R14 | Role server, RLS, storage privat, audit, PII (§3,7) | Deny by default; technical admin hanya laporan yang diperlukan | 1–5 | AC13, SEC01–06 |
| R15 | Legal, backup/restore, kredensial, monitoring, pemisahan lingkungan (§7,13–15) | Runbook dan gerbang rilis; sandbox/preview terisolasi | 1,5 | OPS01–03 |
| R16 | UX HP, sidebar desktop, status kosong/loading/error; bukti harga/ulasan jujur (§4,9) | Komponen konsisten; histori harga; tanpa bukti sosial palsu | 1–5 | AC14, UX01–03 |

Semua 15 acceptance criteria PRD dipetakan di [testing.md](testing.md). `ACxx` merujuk nomor asli PRD §11; ID lain adalah skenario uji turunan, bukan fitur tambahan.

## Audit kelengkapan dan risiko

- **Belum dapat mengunci layanan:** GitHub repo sudah diketahui, tetapi pemilik legal source code, akun billing, akses Vini, dan pemilik layanan lain tetap perlu kesepakatan. Tidak membuat resource atas asumsi.
- **Gateway belum dipilih:** metode QRIS/VA/transfer, signature, expiry, retry, event ordering, refund/dispute dan biaya harus divalidasi terhadap dokumentasi provider sebelum Sprint 3. Rancangan saat ini netral provider.
- **Refund belum lengkap:** pencabutan akses, refund parsial, transaksi manual/kupon 100%, pajak/fee, dan komisi memerlukan keputusan tertulis. Rancangan tidak menetapkan kebijakan bisnis tersebut diam-diam.
- **Email:** penyedia, domain pengirim dan deliverability belum dipilih; verifikasi email tidak boleh digantikan pemeriksaan email dari form checkout.
- **Bundle dan waktu:** snapshot anak dan durasi saat pembelian mencegah perubahan paket mengubah hak historis. Aturan komposisi durasi diusulkan di database; perlu persetujuan sebelum Sprint 3.
- **Video/external SaaS:** link berhak akses bukan pembuatan lisensi otomatis. Embed publik tidak memberi proteksi salinan/DRM; pilih penyedia sah dan jangan menjanjikan anti-pembajakan total.
- **Harga coret dan review:** hanya ditampilkan dengan riwayat promo sah/review pembeli sah; jangan mengisi data produksi fiktif.
- **Kesiapan saat ini:** hanya fondasi dokumen. Tidak ada perilaku aplikasi atau keamanan runtime yang sudah terbukti.

## Bukan cakupan MVP

Tidak ada multi-seller, cart, pengiriman/stok fisik, affiliate/referral kompleks, voucher bertingkat/flash sale/loyalty, chat/live/gamifikasi, native mobile, otomatisasi SaaS tanpa API, subscription, AI deskripsi/prediksi, atau integrasi WhatsApp berbayar/WABA. Nama resource, credential, data, storage, dan project BADAI tidak boleh dipakai.
