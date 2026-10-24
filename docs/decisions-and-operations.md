# Register keputusan dan rencana operasional

Tanggal: 24 Oktober 2026 (WIB). Ini rencana dan daftar prasyarat; bukan bukti provisioning atau persetujuan biaya. PRD v1.0 tetap baseline. Pemilik bisnis yang disebut PRD: Firdi; mitra teknis/komisi: Teh Vini. Penugasan itu tidak otomatis memberikan akses akun atau hak menandatangani kontrak.

## Keputusan yang sudah terkunci oleh PRD / permintaan pengguna

- Identitas teknis `mashura`; display toko awal MASHURA dapat diganti admin.
- Satu toko produk digital, satu SKU per checkout, tanpa cart; membership per produk/entitlement; komisi dasar Rp10000 per transaksi sah (bundle tetap satu).
- Stack Next.js + TypeScript, Supabase dan Vercel; tanpa resource BADAI.
- Target repo existing `PebisnisDigital/mashura` diberikan pengguna dan origin telah diperiksa. Tidak membuat repo baru.
- Pekerjaan saat ini hanya Sprint 0; tidak membuat project Supabase/Vercel atau membangun aplikasi. Tunggu persetujuan sebelum Sprint 1.

## Keputusan terbuka dan gerbang

| ID | Keputusan diperlukan | Rekomendasi / kondisi sekarang, belum disetujui | Penanggung jawab keputusan | Batas waktu |
|---|---|---|---|---|
| D01 | Owner legal source code, GitHub access/offboarding | Repo target tersedia; hak legal dan akses Vini harus ditulis | Firdi + Vini | Sebelum perluasan akses/resource remote |
| D02 | Owner/billing Supabase, Vercel, gateway, email, domain; biaya development/production | Firdi owner bisnis/billing, Vini collaborator minimum; biaya dan akun belum dikunci | Firdi + Vini | Sebelum provisioning/pembelian apa pun |
| D03 | Gateway dan metode aktual, event/expiry, settlement, refund API | Pilih provider Indonesia yang mendukung QRIS/metode disepakati, signature dan sandbox; jangan mengarang provider | Firdi dengan evaluasi Vini | Sebelum Sprint 3 |
| D04 | Refund, revocation, sengketa, partial, manual paid, kupon 100%, pajak/fee dan komisi | Refund mengoreksi ledger; detail dan legal text belum ada | Firdi + Vini | Kebijakan checkout sebelum Sprint 3; seluruh detail sebelum produksi |
| D05 | Periode, jatuh tempo, bukti transfer dan kompensasi honor setelah payout | Sistem rentang bebas dan unpaid/paid; mingguan/bulanan belum dipilih | Firdi + Vini | Sebelum go-live |
| D06 | Provider email/Auth awal, sender domain dan pengiriman OTP/magic link | Pilih mekanisme aman + deliverability terukur; tidak menentukan provider tanpa evaluasi | Firdi + Vini | Sebelum Sprint 4 |
| D07 | Domain produksi, pemilik DNS, kontak dukungan dan legal | Belum dipilih; brand/domain tidak ikut berubah otomatis | Firdi | Sebelum go-live |
| D08 | Warna/logo final | Placeholder netral, editable; tanpa aset Shopee | Firdi | Sebelum pemasaran |
| D09 | Mulai durasi dan aturan bundle | Usulan mulai saat paid; bundle duration berlaku semua item, child list frozen, tanpa nested bundle MVP | Firdi dengan Vini | Sebelum snapshot checkout Sprint 3 |
| D10 | Kapasitas/file size, paket backup, retensi PII/log, RPO/RTO dan support incident | Ukur kebutuhan; batas numerik/anggaran harus dipilih dan diuji | Firdi + Vini | Sebelum produksi; upload cap sebelum Sprint 1 authoring |
| D11 | Persetujuan hasil Sprint 0 → Sprint 1 | Menunggu pengguna; tidak otomatis dari status PRD | Pengguna/pemilik | Sebelum pekerjaan Sprint 1 |

Tidak ada keputusan di atas dijawab dengan asumsi telah disetujui. D03/D06 tidak menghalangi perencanaan atau katalog Sprint 1. D02 menghalangi pembuatan layanan. Tidak meminta credential dalam chat; nanti gunakan secret settings layanan yang tepat.

## SOP yang harus diwujudkan saat implementasi

### Konfigurasi dan rilis

1. Verifikasi akun, owner, billing, nama/id resource MASHURA dan lingkungan target; jangan memilih project default CLI tanpa memeriksa.
2. Gunakan checkout yang tersedia dalam lingkungan cloud terisolasi; tidak membuat worktree kecuali pengguna meminta. Pada Sprint 0 belum perlu install script/startup service.
3. Saat Sprint 1, pin toolchain dan buat instruksi install/start yang telah diuji, `.env.example` nama saja, migration/seed sintetis dan CI. Jangan menyimpan secret ke git.
4. Bedakan lokal/preview/staging/production. Preview memakai sandbox dan DB nonproduksi. Auth redirect origin dan gateway webhook endpoint berizin eksplisit.
5. Uji migration dan backup/restore staging. Apply perubahan kompatibel setelah review; backup terverifikasi sebelum migration berisiko. Deploy hanya setelah gerbang penerimaan dan otorisasi yang berlaku.
6. Rollback aplikasi ke build aman bila perlu, hentikan checkout/webhook effect processor bila integritas terganggu sesuai runbook; simpan event durable untuk replay. Jangan rollback schema destruktif atau menghapus ledger guna menghilangkan error.

### Pembayaran dibayar tetapi akses gagal / pembayaran ganda

Cocokkan provider merchant/environment/payment ID/nominal dengan invoice dan snapshot. Gunakan status gateway server, bukan screenshot. Telusuri event received/processed, accepted order, grant dan accrual dalam satu correlation ID. Jalankan replay/reconcile terpercaya yang idempoten; jangan ubah paid manual dari UI. Pembayaran kedua/late invoice masuk anomali untuk resolusi/refund sesuai policy; simpan jejak uang, keputusan dan aktor. Outbox retry untuk email gagal setelah paid, tanpa charge ulang.

### Email typo, expired link, file hilang

Expired link: resend melalui alur Auth aman dan rate-limited. Email typo: admin memverifikasi bukti kepemilikan lewat prosedur support yang disepakati, mencatat alasan/aktor, dan mengubah binding secara atomik; jangan menerima invoice number saja sebagai bukti identitas. File hilang: beri pesan dukungan, periksa referensi/private object, pulihkan versi atau pengganti dengan audit tanpa membuka bucket publik atau menghapus akses sah lain.

### Rekonsiliasi dan honor

Bandingkan transaksi provider terverifikasi dengan orders/payments, grant per item dan accrual per order sah. Hitung bruto/refund/fee/komisi terpisah; cocokkan rentang UTC yang berasal dari tanggal WIB. Firdi dan Vini membaca ledger yang sama, PII minimum. Tandai payout dengan bukti dan alokasi terotorisasi; refund sesudah payout menjadi adjustment berikutnya. CSV bukan sumber kebenaran baru.

### Backup, insiden dan akses

Sebelum live pilih jadwal/retensi DB, object storage dan RPO/RTO sesuai biaya. Simpan backup terpisah berizin terbatas; restore drill ke MASHURA staging, verifikasi relasi asset/order/grant/ledger dan Auth. Monitor error payment/claim/download, pending event/outbox, mismatch rekonsiliasi, quota/storage/bandwidth dan delivery email tanpa log PII/secret. Tentukan penerima alert dan eskalasi. Saat kompromi cabut akses/kunci terdampak, rotasi secret per lingkungan, periksa audit, uji webhook/Auth kembali; jangan mengubah BADAI.

## Hasil validasi Sprint 0

- Repo awal: hanya README, tidak ada aplikasi; origin menunjuk repo GitHub target, HEAD awal cocok `main` saat audit.
- PRD disalin utuh; integritas diperiksa dengan perbandingan byte dan SHA-256.
- Dokumen audit, arsitektur, database, security, task board, testing dan register keputusan ditambahkan; README menjadi indeks.
- Pemeriksaan link lokal, kelengkapan AC01–AC15, scope dokumentasi dan whitespace dijalankan sebelum commit; hasil spesifik dicatat dalam laporan akhir.
- Tidak menjalankan tes aplikasi, migration, deployment, pembayaran, provisioning atau koneksi BADAI. Ini bukan release/production-ready.
- Penyerahan melalui commit/push GitHub diverifikasi terpisah setelah dokumentasi selesai; status push dilaporkan kepada pengguna, bukan diasumsikan dari commit lokal.

## Serah-terima

Tinjau rancangan dan keputusan D01–D11. Setelah pengguna menyetujui Sprint 1, kerjakan hanya fondasi/admin katalog sesuai task board. Pembuatan resource tetap menunggu kepemilikan/akun/billing yang jelas. Tidak ada deployment atau langganan baru yang diotorisasi oleh dokumen ini.
