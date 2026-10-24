import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { settings } from "@/lib/data";
import { Brand } from "@/components/brand";
import { logout } from "@/app/actions";
export const dynamic = "force-dynamic";
const nav = [
  ["/admin", "Beranda", "◈"],
  ["/admin/pesanan", "Pesanan", "▤"],
  ["/admin/produk", "Produk", "▦"],
  ["/admin/keuangan", "Keuangan", "↗"],
  ["/admin/lainnya", "Lainnya", "⋯"],
];
export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAdmin();
  const store = await settings();
  return (
    <div
      className="admin-shell"
      style={{ "--accent": store.accent_color } as React.CSSProperties}
    >
      <aside className="sidebar">
        <Brand store={store} />
        <p className="eyebrow">RUANG KELOLA TOKO</p>
        <nav aria-label="Navigasi utama admin">
          {nav.map(([href, label, icon]) => (
            <Link key={href} href={href}>
              <span aria-hidden="true">{icon}</span>
              {label}
            </Link>
          ))}
          <Link href="/admin/kategori">Kategori</Link>
          <Link href="/admin/pengaturan">Pengaturan toko</Link>
        </nav>
        <div className="sidebar-foot">
          Satu toko. Semua potensi.
          <br />
          <small>MASHURA · Sprint 1</small>
        </div>
      </aside>
      <div className="workspace">
        <header className="topbar">
          <span>
            Dashboard toko <span className="badge">Admin bisnis</span>
          </span>
          <form action={logout}>
            <button className="text-button">Keluar</button>
          </form>
        </header>
        <main className="admin-content">{children}</main>
      </div>
      <nav className="bottom-nav" aria-label="Navigasi HP">
        {nav.map(([href, label, icon]) => (
          <Link key={href} href={href}>
            <span aria-hidden="true">{icon}</span>
            {label}
          </Link>
        ))}
      </nav>
    </div>
  );
}
