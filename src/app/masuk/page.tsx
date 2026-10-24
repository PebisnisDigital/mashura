import { LoginForm } from "@/components/login-form";
import Link from "next/link";
export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  return (
    <main className="login-shell">
      <Link href="/" className="eyebrow">
        ← Kembali ke toko
      </Link>
      <section className="panel">
        <p className="eyebrow">MASHURA · ADMIN</p>
        <h1>Selamat datang kembali.</h1>
        <p className="muted">
          Masuk untuk mengelola produk dan identitas toko.
        </p>
        {status === "setup" && (
          <p className="notice">
            Koneksi Supabase MASHURA belum diatur. Lihat docs/development.md.
          </p>
        )}
        {status === "forbidden" && (
          <p role="alert" className="notice">
            Akun ini tidak memiliki izin admin bisnis.
          </p>
        )}
        <LoginForm />
      </section>
    </main>
  );
}
