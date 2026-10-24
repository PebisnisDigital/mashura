import Link from "next/link";
export default function NotFound() {
  return (
    <main className="login-shell">
      <h1>Halaman tidak ditemukan</h1>
      <Link href="/">Kembali ke toko</Link>
    </main>
  );
}
