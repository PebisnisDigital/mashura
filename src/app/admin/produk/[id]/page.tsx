import { notFound } from "next/navigation";
import { ProductEditor } from "@/components/product-editor";
import { catalog, productEditorData } from "@/lib/data";
import { z } from "zod";
export default async function Edit({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ saved?: string; duplicate?: string }>;
}) {
  const { id } = await params;
  if (!z.uuid().safeParse(id).success) notFound();
  const [{ products, categories }, p, s] = await Promise.all([
    catalog(),
    productEditorData(id),
    searchParams,
  ]);
  if (!p) notFound();
  const initial = s.duplicate
    ? {
        ...p,
        id: undefined,
        title: `${p.title} (salinan)`,
        slug: `${p.slug}-salinan-${crypto.randomUUID().slice(0, 6)}`,
        status: "draft" as const,
        materials: p.materials.map((m) => ({ ...m, id: undefined })),
      }
    : p;
  return (
    <>
      <div role="status">
        {s.saved && <p className="notice success">Produk berhasil disimpan.</p>}
      </div>
      <ProductEditor
        key={s.duplicate ? "copy" : id}
        initial={initial}
        products={products}
        categories={categories}
      />
    </>
  );
}
