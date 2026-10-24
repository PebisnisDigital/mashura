import Link from "next/link";
export default function More() {
  return (
    <>
      <p className="eyebrow">RUANG KELOLA</p>
      <h1>Lainnya</h1>
      <div className="quick-links panel">
        <Link href="/admin/pengaturan">Pengaturan toko →</Link>
        <Link href="/admin/kategori">Kategori →</Link>
        <Link href="/">Lihat halaman toko →</Link>
      </div>
    </>
  );
}
