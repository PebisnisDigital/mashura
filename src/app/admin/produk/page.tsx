import Link from "next/link";
import { catalog } from "@/lib/data";
import { productTypes, rupiah } from "@/lib/catalog";
export default async function Products({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string; type?: string }>;
}) {
  const { products } = await catalog();
  const filter = await searchParams;
  const list = products.filter(
    (p) =>
      (!filter.q ||
        `${p.title} ${p.slug}`
          .toLowerCase()
          .includes(filter.q.toLowerCase())) &&
      (!filter.status || p.status === filter.status) &&
      (!filter.type || p.type === filter.type),
  );
  return (
    <>
      <div className="page-heading">
        <div>
          <p className="eyebrow">KATALOG</p>
          <h1>Produk</h1>
          <p className="muted">
            Kelola ide, materi, dan produk yang siap diterbitkan.
          </p>
        </div>
        <Link className="button" href="/admin/produk/baru">
          + Tambah produk
        </Link>
      </div>
      <form className="filters">
        <label className="grow">
          Cari produk
          <input
            name="q"
            defaultValue={filter.q}
            placeholder="Judul atau slug"
          />
        </label>
        <label>
          Status
          <select name="status" defaultValue={filter.status}>
            <option value="">Semua status</option>
            <option value="draft">Draft</option>
            <option value="published">Terbit</option>
            <option value="inactive">Nonaktif</option>
          </select>
        </label>
        <label>
          Tipe
          <select name="type" defaultValue={filter.type}>
            <option value="">Semua tipe</option>
            {Object.entries(productTypes).map(([k, v]) => (
              <option key={k} value={k}>
                {v}
              </option>
            ))}
          </select>
        </label>
        <button className="secondary">Terapkan</button>
      </form>
      <div className="product-list">
        {list.map((p) => (
          <article className="product-row" key={p.id}>
            <div className="product-icon" aria-hidden="true">
              {p.type === "course" ? "▤" : "▧"}
            </div>
            <div className="grow">
              <span className="hint">{productTypes[p.type]}</span>
              <h2>
                <Link href={`/admin/produk/${p.id}`}>{p.title}</Link>
              </h2>
              <span className={`badge ${p.status}`}>
                {p.status === "published"
                  ? "Terbit"
                  : p.status === "draft"
                    ? "Draft"
                    : "Nonaktif"}
              </span>
            </div>
            <strong>{rupiah(p.price_idr)}</strong>
            <Link className="button secondary" href={`/admin/produk/${p.id}`}>
              Kelola
            </Link>
          </article>
        ))}
      </div>
      {!list.length && (
        <section className="empty panel">
          <h2>Belum ada produk di daftar ini</h2>
          <p>Tambahkan produk pertama atau ubah filter pencarian.</p>
          <Link href="/admin/produk/baru" className="button">
            Buat produk
          </Link>
        </section>
      )}
    </>
  );
}
