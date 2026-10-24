# Rancangan keamanan dan otorisasi

Status: kontrol yang harus diimplementasikan dan diuji, belum klaim keamanan runtime. Acuan PRD §3,7,11.13. Default deny; setiap jalur Data API, server handler, RPC dan Storage harus memiliki otorisasi sendiri.

## Matriks akses

| Resource/aksi | Pengunjung | Member | Admin bisnis Firdi | Admin teknis Vini |
|---|---|---|---|---|
| Branding, katalog published, review terverifikasi publik | Baca field aman | Sama | Kelola | Sama seperti publik |
| Draft/preview produk, materi penuh, pengaturan | Tolak | Tolak tanpa entitlement untuk materi | Kelola sesuai tugas | Tolak secara default |
| Profil | Tolak | Baca/edit field aman sendiri | Cari member sesuai operasi | Tolak |
| Orders/invoice | Token tamu terbatas untuk invoice sendiri | Baca milik sendiri | Baca/cari seluruh toko | Laporan transaksi minimal, PII disamarkan |
| Payment status/event/refund mutasi | Tolak | Tolak | Permintaan operasional via server terotorisasi | Tolak; tidak boleh menandai paid |
| Materi/file privat | Tolak | Hanya grant aktif milik sendiri | Kelola/preview terotorisasi | Tolak default |
| Grant/revoke/resend login | Tolak | Tolak | Via server, alasan/audit wajib | Tolak |
| Ledger dan CSV komisi | Tolak | Tolak | Baca, payout/refund sesuai kebijakan | Baca laporan yang sama, tanpa mutasi keuangan |
| Role admin | Tolak | Tolak | Bukan CRUD dari profil umum | Bukan CRUD dari profil umum |
| Audit/secret/internal event | Tolak | Tolak | Audit bisnis tersanitasi sesuai kebutuhan | Audit teknis tersanitasi sesuai kebutuhan |

Akses teknis tambahan bagi Vini harus eksplisit, minimum, terbatas waktu dan diaudit; bukan role superadmin permanen. Role database disimpan di tabel terlindungi, tidak dari `user_metadata` yang dapat diedit pengguna. Bootstrap dan pencabutan role melalui prosedur operator sah; tidak menyediakan eskalasi diri dari dashboard.

## Kebijakan RLS yang direncanakan

- Aktifkan RLS pada semua tabel exposed dan beri grant SQL minimum. `profiles`: SELECT/UPDATE id = auth.uid(), kolom privileged tidak dapat ditulis user. Role diambil dari helper yang membaca admin_roles terlindungi; helper tidak rekursif dan search_path tetap.
- `products/categories/media/settings`: publik hanya field aman dan relasi produk published. Karena RLS membatasi row, bukan kolom, pisahkan body rahasia ke tabel privat serta gunakan column grants/view proyeksi aman. Full catalog draft hanya business_admin. View publik tidak melewati RLS secara tidak sengaja.
- `orders`: member hanya member_id = auth.uid(); belum claimed tidak bisa dicari berdasarkan email request. Pengunjung tidak SELECT tabel order; invoice tamu melalui handler token. Member tidak INSERT/UPDATE payment/grant/ledger secara langsung. Admin teknis memakai projection laporan yang menyamarkan PII.
- `member_entitlements`: member hanya miliknya; tidak bisa UPDATE member_id/expiry/revoke. Claim melalui fungsi server yang menguji email terverifikasi dari Auth, bukan input klien. Semua sumber grant diverifikasi.
- `product_materials/private_assets`: member hanya published material dengan effective grant; blob tidak publik. Unpublish produk tidak otomatis membatalkan pembelian lama. Data API tidak dapat dipakai untuk melompati pemeriksaan access endpoint.
- `storage.objects`: bucket file berbayar privat, tanpa public read/list. Member tidak diberi SELECT semua object; jalur unduhan melalui server yang mengecek grant dan menandatangani object tertentu. Business admin upload dibatasi path/bucket/type/ukuran. Public bucket hanya aset katalog/branding yang memang aman dipublikasikan.
- Payment events, ledger writes, refunds, payout allocations, outbox dan audit append dilakukan fungsi terpercaya dengan pemeriksaan capability, tidak endpoint CRUD terbuka. SQL function privileged: `REVOKE EXECUTE` dari public/anon/authenticated kecuali perlu; search_path tetap, parameter tervalidasi, log aman. Service key bypass RLS sehingga setiap jalur pengguna yang memakainya harus melakukan cek eksplisit.

## Ancaman dan kontrol wajib

| Ancaman | Kontrol dan uji |
|---|---|
| IDOR antar member atau invoice ditebak | Uji dua akun A/B pada server, REST/RPC dan Storage; token invoice acak disimpan hash; nomor invoice bukan izin |
| Eskalasi role dari metadata/JWT lama | Role authoritative server/database per mutasi; uji edit metadata tidak berpengaruh; pencabutan role segera efektif |
| Webhook palsu/replay/duplikat/konkurensi | Raw-body signature + verifikasi provider, cocokkan nominal/currency/merchant/env, unique keys dan transaksi; 10 replay dan parallel retry |
| URL bocor/cache lintas pengguna | Signed URL pendek, response private/no-store untuk auth/invoice/download; jangan cache PII atau signed URL di CDN; referrer policy aman |
| XSS dari deskripsi/prompt/branding/link | Sanitasi allowlist rich text, output encoding, tolak javascript/data URL, CSP disesuaikan embed sah; kontrol favicon/image eksternal |
| CSRF pada mutasi admin | Session aman, cek Origin/CSRF sesuai framework; cookie secure/httpOnly/SameSite; jangan mutasi via GET |
| Penyalahgunaan OTP/checkout/upload | Rate limit berdasarkan identity/IP yang mempertimbangkan shared IP; pesan generik, batas ukuran body/upload, validasi server |
| File berbahaya/path traversal/SSRF | MIME+signature/ukuran allowlist, object key dibuat server; HTML/SVG aktif tidak diizinkan sembarangan; external link tidak otomatis di-fetch server |
| CSV injection/PII bocor | Escape formula `= + - @` dan kontrol whitespace, quoting; field minimal dan akses finance diaudit |
| Harga/payment manipulasi | Hitung server, snapshot immutable, status tidak dari redirect/screenshot, audit harga/refund/payout |
| Rahasia bocor di preview/log/git | Credential per lingkungan; tidak ada live key preview; server-only imports; redaksi payload/error/token; secret scan sebelum commit |
| Email salah/claim takeover | Verified email authoritative; jangan strip plus/dots sembarangan; koreksi hanya dukungan terverifikasi, bukti minimal dan audit |

## Audit, privasi dan pemulihan

Catat aktor, target, tindakan, waktu UTC, alasan, correlation ID dan diff tersanitasi untuk role, harga/publish, manual grant/revoke, koreksi email, refund, payout dan perubahan kritis. Audit append-only, tidak dapat dihapus lewat UI role bisnis/teknis. Hindari log nama/email/WA penuh, token, signature, secret atau materi berbayar. Raw webhook hanya bila benar-benar diperlukan dengan retensi dan akses terbatas; default safe payload + digest.

PII terbatas pada kebutuhan checkout/member/support. Kebijakan retensi order/audit/keuangan dan permintaan penghapusan harus diputuskan sebelum live; anonymization tidak merusak catatan wajib. Consent/syarat/refund policy version disnapshot saat pembelian. Halaman legal wajib tersedia.

Backup database tidak otomatis mencakup Storage: rencana pemulihan harus menguji keduanya, mapping asset, konfigurasi Auth dan webhook. Secrets tidak masuk backup repo. Rotasi key per layanan, cabut akses mantan pengembang, uji webhook/email sesudah rotasi. Prosedur dan gerbang operasional ada di [decisions-and-operations.md](decisions-and-operations.md).
