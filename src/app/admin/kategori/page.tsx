import { catalog } from "@/lib/data";
import { CategoryEditor } from "@/components/category-editor";
export default async function Categories() {
  const { categories } = await catalog();
  return (
    <>
      <div className="page-heading">
        <div>
          <p className="eyebrow">KELOLA KATALOG</p>
          <h1>Kategori</h1>
          <p className="muted">
            Nama yang jelas membantu pembeli menemukan produk.
          </p>
        </div>
      </div>
      <div className="category-grid">
        <CategoryEditor />
        {categories.map((c) => (
          <CategoryEditor key={c.id} initial={c} />
        ))}
      </div>
    </>
  );
}
