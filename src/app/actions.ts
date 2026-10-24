"use server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { supabase, configured } from "@/lib/supabase/server";
import { parsePayload, productSchema, settingsSchema } from "@/lib/catalog";
import { z } from "zod";
export type FormState = { error: string };
function message(error: unknown) {
  return error instanceof z.ZodError
    ? error.issues.map((i) => i.message).join("; ")
    : error instanceof Error
      ? error.message
      : "Perubahan gagal disimpan";
}
export async function saveProduct(
  _state: FormState,
  form: FormData,
): Promise<FormState> {
  const { db } = await requireAdmin();
  let id: string;
  try {
    const input = productSchema.parse(parsePayload(form));
    const { data, error } = await db.rpc("save_product", { data: input });
    if (error) return { error: error.message };
    id = data as string;
  } catch (e) {
    return { error: message(e) };
  }
  revalidatePath("/", "layout");
  redirect(`/admin/produk/${id}?saved=1`);
}
export async function saveSettings(
  _state: FormState,
  form: FormData,
): Promise<FormState> {
  const { db } = await requireAdmin();
  try {
    const input = settingsSchema.parse(parsePayload(form));
    const { error } = await db.rpc("save_settings", { data: input });
    if (error) return { error: error.message };
  } catch (e) {
    return { error: message(e) };
  }
  revalidatePath("/", "layout");
  redirect("/admin/pengaturan?saved=1");
}
export async function saveCategory(
  _state: FormState,
  form: FormData,
): Promise<FormState> {
  const { db } = await requireAdmin();
  try {
    const input = z
      .object({
        id: z.uuid().optional(),
        name: z.string().trim().min(1).max(80),
        slug: z.string().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/),
        is_active: z.boolean(),
      })
      .parse(parsePayload(form));
    const { error } = await db.rpc("save_category", { data: input });
    if (error) return { error: error.message };
  } catch (e) {
    return { error: message(e) };
  }
  revalidatePath("/admin/kategori");
  return { error: "Tersimpan. Daftar kategori telah diperbarui." };
}
export async function login(
  _state: FormState,
  form: FormData,
): Promise<FormState> {
  if (!configured())
    return { error: "Supabase belum diatur. Ikuti panduan development." };
  const input = z
    .object({ email: z.email().max(254), password: z.string().min(1).max(256) })
    .safeParse(Object.fromEntries(form));
  if (!input.success)
    return { error: "Masukkan email dan password yang valid." };
  const db = await supabase();
  const { error } = await db.auth.signInWithPassword(input.data);
  if (error)
    return {
      error:
        "Login tidak berhasil. Periksa email dan password atau hubungi pemilik akun.",
    };
  redirect("/admin");
}
export async function logout() {
  const db = await supabase();
  await db.auth.signOut();
  redirect("/masuk");
}
