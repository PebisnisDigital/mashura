import { isMashuraTarget } from "../src/lib/environment";
import { describe, it, expect } from "vitest";
import {
  emptyProduct,
  productSchema,
  settingsSchema,
  defaultSettings,
  slugify,
} from "../src/lib/catalog";
import { inspectUpload, MAX_UPLOAD } from "../src/lib/uploads";
describe("validasi katalog server", () => {
  it("normalisasi slug", () =>
    expect(slugify("Kelas Bisnis — Pemula!")).toBe("kelas-bisnis-pemula"));
  it("draft minimum diterima, publish kosong ditolak", () => {
    const p = { ...emptyProduct, title: "Produk", slug: "produk" };
    expect(productSchema.safeParse(p).success).toBe(true);
    expect(productSchema.safeParse({ ...p, status: "published" }).success).toBe(
      false,
    );
  });
  it("harga negatif/pecahan dan akses selain 30/365 ditolak", () => {
    for (const change of [
      { price_idr: -1 },
      { price_idr: 1.5 },
      { access_days: 7 },
    ])
      expect(
        productSchema.safeParse({
          ...emptyProduct,
          title: "A",
          slug: "a",
          ...change,
        }).success,
      ).toBe(false);
  });
  it("URL script dan CSS berbahaya ditolak", () => {
    expect(
      settingsSchema.safeParse({
        ...defaultSettings,
        logo_url: "javascript:alert(1)",
      }).success,
    ).toBe(false);
    expect(
      settingsSchema.safeParse({
        ...defaultSettings,
        accent_color: "red;display:none",
      }).success,
    ).toBe(false);
  });
  it("materi kosong tidak dapat published", () => {
    const p = {
      ...emptyProduct,
      title: "P",
      slug: "p",
      status: "published",
      category_id: crypto.randomUUID(),
      summary: "Isi",
      description: "Deskripsi",
      included_items: "Teks",
      terms: "Syarat",
      media: [
        { url: "https://example.com/a.png", alt_text: "Cover", position: 0 },
      ],
      materials: [
        {
          title: "LMS",
          chapter: "Bab",
          kind: "lesson",
          body: "",
          video_url: "",
          external_url: "",
          asset_id: "",
          position: 0,
          status: "published",
        },
      ],
    };
    expect(productSchema.safeParse(p).success).toBe(false);
  });
});
describe("validasi bytes upload", () => {
  it("PDF valid dan PNG valid diterima", () => {
    expect(
      inspectUpload(
        "materi.pdf",
        new TextEncoder().encode("%PDF-1.7\n"),
        "private",
      ).mime,
    ).toBe("application/pdf");
    expect(
      inspectUpload(
        "logo.png",
        new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10]),
        "public",
      ).mime,
    ).toBe("image/png");
  });
  it("MIME spoof, HTML/SVG, zip sebagai gambar, kosong dan oversize ditolak", () => {
    for (const [name, b] of [
      ["fake.pdf", "<script>evil</script>"],
      ["a.svg", "<svg/>"],
      ["a.png", "PKxx"],
      ["a.txt", ""],
    ] as const)
      expect(() =>
        inspectUpload(name, new TextEncoder().encode(b), "public"),
      ).toThrow();
    expect(() =>
      inspectUpload("x.txt", new Uint8Array(MAX_UPLOAD + 1), "private"),
    ).toThrow();
  });
});

describe("isolasi target environment MASHURA", () => {
  it("menolak remote tanpa pin, salah pin, credential URL dan domain lain", () => {
    expect(
      isMashuraTarget("https://mashuraref.supabase.co", "test", undefined),
    ).toBe(false);
    expect(
      isMashuraTarget("https://otherproject.supabase.co", "test", "mashuraref"),
    ).toBe(false);
    expect(
      isMashuraTarget(
        "https://user:pass@mashuraref.supabase.co",
        "test",
        "mashuraref",
      ),
    ).toBe(false);
    expect(isMashuraTarget("https://example.com", "test", "mashuraref")).toBe(
      false,
    );
  });
  it("menerima project reference cocok atau backend Supabase lokal", () => {
    expect(
      isMashuraTarget("https://mashuraref.supabase.co", "test", "mashuraref"),
    ).toBe(true);
    expect(isMashuraTarget("http://127.0.0.1:54321", "test", undefined)).toBe(
      true,
    );
  });
});
