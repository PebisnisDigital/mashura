import { ProductEditor } from "@/components/product-editor";
import { catalog } from "@/lib/data";
import { emptyProduct } from "@/lib/catalog";
export default async function New() {
  const { products, categories } = await catalog();
  return (
    <ProductEditor
      initial={emptyProduct}
      products={products}
      categories={categories}
    />
  );
}
