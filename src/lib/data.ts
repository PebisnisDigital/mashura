import "server-only";
import { supabase, configured } from "./supabase/server";
import {
  defaultSettings,
  settingsSchema,
  emptyProduct,
  type ProductInput,
  type Product,
  type Category,
} from "./catalog";
import { requireAdmin } from "./auth";
export async function settings() {
  if (!configured()) return defaultSettings;
  const db = await supabase();
  const { data, error } = await db.from("store_settings").select("*").single();
  if (error)
    throw new Error(
      "Pengaturan toko belum dapat dimuat. Periksa database MASHURA.",
    );
  return settingsSchema.parse(data);
}
export async function catalog() {
  const { db } = await requireAdmin();
  const [p, c] = await Promise.all([
    db.from("products").select("*").order("updated_at", { ascending: false }),
    db.from("categories").select("*").order("name"),
  ]);
  if (p.error || c.error)
    throw new Error(
      "Katalog gagal dimuat. Periksa migration dan akses database.",
    );
  return { products: p.data as Product[], categories: c.data as Category[] };
}
export async function productEditorData(
  id: string,
): Promise<ProductInput | null> {
  const { db } = await requireAdmin();
  const [p, m, a, b] = await Promise.all([
    db.from("products").select("*").eq("id", id).maybeSingle(),
    db.from("product_media").select("*").eq("product_id", id).order("position"),
    db
      .from("product_materials")
      .select("*")
      .eq("product_id", id)
      .neq("status", "archived")
      .order("position"),
    db
      .from("bundle_items")
      .select("child_product_id")
      .eq("bundle_product_id", id),
  ]);
  if (p.error || m.error || a.error || b.error)
    throw new Error("Produk tidak dapat dimuat");
  if (!p.data) return null;
  return {
    ...emptyProduct,
    ...p.data,
    category_id: p.data.category_id ?? "",
    media: m.data ?? [],
    materials: (a.data ?? []).map((x) => ({
      ...x,
      asset_id: x.asset_id ?? "",
    })),
    child_ids: (b.data ?? []).map((x) => x.child_product_id),
    price_reason: "",
  } as ProductInput;
}
