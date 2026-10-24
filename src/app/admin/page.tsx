import Link from "next/link";
import { catalog } from "@/lib/data";
export default async function Dashboard() {
  const { products } = await catalog();
  return (
    <>
      <div className="page-heading">
        <div>
          <p className="eyebrow">RINGKASAN TOKO</p>
          <h1>Mulai dari produk yang baik.</h1>
          <p className="muted">
            Siapkan katalog, materi, dan identitas toko Anda.
          </p>
        </div>
        <Link className="button" href="/admin/produk/baru">
          + Tambah produk
        </Link>
      </div>
      <section className="stat-grid">
        <article className="stat">
          <span>Total produk</span>
          <strong>{products.length}</strong>
        </article>
        <article className="stat">
          <span>Produk terbit</span>
          <strong>
            {products.filter((p) => p.status === "published").length}
          </strong>
        </article>
        <article className="stat">
          <span>Masih draft</span>
          <strong>{products.filter((p) => p.status === "draft").length}</strong>
        </article>
      </section>
      <section className="panel">
        <p className="eyebrow">LANGKAH BERIKUTNYA</p>
        <h2>Bangun fondasi toko Anda</h2>
        <div className="quick-links">
          <Link href="/admin/pengaturan">
            <strong>01 · Identitas toko</strong>
            <span>Nama, logo, banner, dan kontak dukungan →</span>
          </Link>
          <Link href="/admin/kategori">
            <strong>02 · Kategori produk</strong>
            <span>Rapikan katalog agar mudah ditemukan →</span>
          </Link>
          <Link href="/admin/produk/baru">
            <strong>03 · Produk pertama</strong>
            <span>Tulis deskripsi dan unggah materi privat →</span>
          </Link>
        </div>
      </section>
      <p className="hint">
        Pesanan, omzet, dan komisi tersedia pada sprint pembayaran dan keuangan.
        Belum ada transaksi yang diterima aplikasi ini.
      </p>
    </>
  );
}
