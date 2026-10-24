import { z } from "zod";
export const productTypes = {
  course: "Kursus / LMS",
  pdf: "Ebook / PDF",
  file: "Template / File",
  prompt: "Prompt digital",
  external: "Akses tautan eksternal",
  bundle: "Bundle",
} as const;
export const slugify = (text: string) =>
  text
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
const text = z.string().max(20000);
const url = z
  .string()
  .max(2048)
  .refine(
    (v) => !v || (/^https?:\/\//.test(v) && URL.canParse(v)),
    "Gunakan URL http/https yang sah",
  );
const uuid = z.uuid();
export const materialSchema = z.object({
  id: uuid.optional(),
  chapter: z.string().max(160),
  title: z.string().max(160),
  kind: z.enum(["lesson", "file", "prompt", "external"]),
  body: text,
  video_url: url,
  external_url: url,
  asset_id: z.union([uuid, z.literal("")]),
  position: z.number().int().min(0),
  status: z.enum(["draft", "published"]),
});
export const productSchema = z
  .object({
    id: uuid.optional(),
    title: z.string().trim().min(1, "Judul wajib").max(160),
    slug: z.string().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, "Slug tidak valid"),
    category_id: z.union([uuid, z.literal("")]),
    type: z.enum(["course", "pdf", "file", "prompt", "external", "bundle"]),
    status: z.enum(["draft", "published", "inactive"]),
    price_idr: z.number().int().min(0).max(1000000000),
    summary: text,
    description: text,
    benefits: text,
    included_items: text,
    requirements: text,
    faq: text,
    terms: text,
    access_days: z.union([z.literal(30), z.literal(365), z.null()]),
    is_featured: z.boolean(),
    featured_position: z.number().int().min(0).max(10000),
    price_reason: z.string().max(500),
    media: z
      .array(
        z.object({
          url,
          alt_text: z.string().max(160),
          position: z.number().int().min(0),
        }),
      )
      .max(12),
    materials: z.array(materialSchema).max(100),
    child_ids: z.array(uuid).max(100),
  })
  .superRefine((p, ctx) => {
    if (p.type === "bundle" && p.id && p.child_ids.includes(p.id))
      ctx.addIssue({
        code: "custom",
        message: "Bundle tidak boleh memuat dirinya sendiri",
      });
    if (p.status !== "published") return;
    for (const key of [
      "category_id",
      "summary",
      "description",
      "included_items",
      "terms",
    ] as const)
      if (!p[key].trim())
        ctx.addIssue({
          code: "custom",
          path: [key],
          message: `Lengkapi ${key} sebelum publish`,
        });
    if (!p.media.length || !p.media[0]?.url)
      ctx.addIssue({ code: "custom", message: "Cover wajib sebelum publish" });
    if (p.type === "bundle" && !p.child_ids.length)
      ctx.addIssue({ code: "custom", message: "Pilih produk anak bundle" });
    if (
      p.type !== "bundle" &&
      !p.materials.some((m) => m.status === "published")
    )
      ctx.addIssue({
        code: "custom",
        message: "Terbitkan setidaknya satu materi",
      });
    if (
      p.type === "course" &&
      !p.materials.some((m) => m.kind === "lesson" && m.status === "published")
    )
      ctx.addIssue({
        code: "custom",
        message: "Kursus membutuhkan setidaknya satu pelajaran terbit",
      });
    for (const m of p.materials.filter((m) => m.status === "published")) {
      const expected =
        p.type === "course"
          ? "lesson"
          : p.type === "pdf" || p.type === "file"
            ? "file"
            : p.type;
      if (
        (m.kind !== expected && !(p.type === "course" && m.kind === "file")) ||
        !m.title.trim()
      )
        ctx.addIssue({
          code: "custom",
          message: "Judul dan jenis materi wajib sesuai tipe produk",
        });
      if (
        (m.kind === "file" && !m.asset_id) ||
        (m.kind === "prompt" && !m.body.trim()) ||
        (m.kind === "external" && !m.external_url) ||
        (m.kind === "lesson" && !m.body.trim() && !m.video_url)
      )
        ctx.addIssue({
          code: "custom",
          message: "Isi/file/tautan materi terbit belum lengkap",
        });
    }
  });
export type ProductInput = z.infer<typeof productSchema>;
export type Material = z.infer<typeof materialSchema>;
export type Category = {
  id: string;
  name: string;
  slug: string;
  is_active: boolean;
};
export type Product = ProductInput & {
  id: string;
  created_at: string;
  updated_at: string;
};
export const emptyProduct: ProductInput = {
  title: "",
  slug: "",
  category_id: "",
  type: "course",
  status: "draft",
  price_idr: 50000,
  summary: "",
  description: "",
  benefits: "",
  included_items: "",
  requirements: "",
  faq: "",
  terms: "",
  access_days: null,
  is_featured: false,
  featured_position: 0,
  price_reason: "",
  media: [],
  materials: [],
  child_ids: [],
};
export const settingsSchema = z.object({
  display_name: z.string().trim().min(1).max(80),
  description: text,
  logo_url: url,
  favicon_url: url,
  accent_color: z.string().regex(/^#[a-fA-F0-9]{6}$/),
  support_contact: z.string().max(500),
  general_faq: text,
  legal_text: text,
  banners: z
    .array(
      z.object({ title: z.string().max(160), image_url: url, target_url: url }),
    )
    .max(10),
});
export type StoreSettings = z.infer<typeof settingsSchema>;
export const defaultSettings: StoreSettings = {
  display_name: "MASHURA",
  description: "Toko produk digital & membership",
  logo_url: "",
  favicon_url: "",
  accent_color: "#34584a",
  support_contact: "",
  general_faq: "",
  legal_text: "",
  banners: [],
};
export function parsePayload(form: FormData): unknown {
  const raw = form.get("payload");
  if (typeof raw !== "string" || raw.length > 250000)
    throw new Error("Data form tidak valid atau terlalu besar");
  return JSON.parse(raw);
}
export const rupiah = (value: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);
