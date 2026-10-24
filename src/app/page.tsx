import Link from "next/link";
import { settings } from "@/lib/data";
import { Brand } from "@/components/brand";
export const dynamic = "force-dynamic";
export default async function Home() {
  const store = await settings();
  return (
    <main
      className="public-shell"
      style={{ "--accent": store.accent_color } as React.CSSProperties}
    >
      <header className="public-header">
        <Brand store={store} />
        <Link className="button secondary" href="/masuk">
          Masuk admin
        </Link>
      </header>
      <section className="hero">
        <p className="eyebrow">TOKO PRODUK DIGITAL & MEMBERSHIP</p>
        <h1>{store.display_name}</h1>
        <p>
          {store.description ||
            "Tempat bertumbuh lewat produk digital pilihan."}
        </p>
        <div className="notice">
          Toko sedang disiapkan. Katalog dan pembelian belum dibuka.
        </div>
        {store.support_contact && <p>Hubungi kami: {store.support_contact}</p>}
      </section>
      <footer>
        {store.legal_text && <p className="pre-wrap">{store.legal_text}</p>}
        <p>
          © {new Date().getFullYear()} {store.display_name}
        </p>
      </footer>
    </main>
  );
}
