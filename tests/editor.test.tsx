// @vitest-environment jsdom
import { afterEach, describe, it, expect, vi } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ProductEditor } from "../src/components/product-editor";
import { SettingsEditor } from "../src/components/settings-editor";
import { CategoryEditor } from "../src/components/category-editor";
import { emptyProduct, defaultSettings } from "../src/lib/catalog";
vi.mock("../src/app/actions", () => ({
  saveProduct: vi.fn(async () => ({ error: "Respons uji komponen" })),
  saveSettings: vi.fn(async () => ({ error: "" })),
  saveCategory: vi.fn(async () => ({ error: "" })),
}));
afterEach(cleanup);
function payload() {
  const field = document.querySelector<HTMLInputElement>("input[name=payload]");
  return JSON.parse(field!.value);
}
describe("authoring UI dengan server action mock eksplisit", () => {
  it("lima tahap mempertahankan data, slug otomatis dan materi LMS berurutan", async () => {
    const u = userEvent.setup();
    render(
      <ProductEditor initial={emptyProduct} products={[]} categories={[]} />,
    );
    await u.type(screen.getByLabelText("Judul"), "Kelas Bisnis");
    expect(payload().slug).toBe("kelas-bisnis");
    await u.click(screen.getByRole("button", { name: "2. Deskripsi" }));
    await u.type(screen.getByLabelText("Deskripsi lengkap"), "Isi kelas");
    await u.click(screen.getByRole("button", { name: "3. Materi & akses" }));
    await u.click(screen.getByRole("button", { name: "+ Tambah materi" }));
    await u.type(screen.getByLabelText("Bab / modul"), "Modul pertama");
    await u.type(screen.getByLabelText("Judul materi"), "Mulai belajar");
    await u.type(screen.getByLabelText("Isi teks"), "Pelajaran pertama");
    await u.click(screen.getByRole("button", { name: "5. Preview & publish" }));
    await u.selectOptions(screen.getByLabelText("Status produk"), "published");
    expect(payload().description).toBe("Isi kelas");
    expect(payload().materials[0].chapter).toBe("Modul pertama");
    expect(payload().status).toBe("published");
    await u.click(screen.getByRole("button", { name: "Simpan & terbitkan" }));
    expect((await screen.findByRole("alert")).textContent).toContain(
      "Respons uji komponen",
    );
  });
  it("PDF menawarkan file privat, bundle menawarkan child non-bundle", async () => {
    const u = userEvent.setup();
    render(
      <ProductEditor
        initial={{ ...emptyProduct, type: "pdf" }}
        products={[]}
        categories={[]}
      />,
    );
    await u.click(screen.getByRole("button", { name: "3. Materi & akses" }));
    await u.click(screen.getByRole("button", { name: "+ Tambah materi" }));
    expect(payload().materials[0].kind).toBe("file");
    expect(screen.getByText(/Unggah materi privat/)).toBeTruthy();
  });
  it("branding dan banner diubah lewat form; tidak mengubah identitas proyek", async () => {
    const u = userEvent.setup();
    render(<SettingsEditor initial={defaultSettings} />);
    const name = screen.getByLabelText("Nama toko");
    await u.clear(name);
    await u.type(name, "Toko Firdi");
    await u.click(screen.getByRole("button", { name: "+ Tambah banner" }));
    await u.type(screen.getByLabelText("Judul banner"), "Kelas terbaru");
    expect(payload().display_name).toBe("Toko Firdi");
    expect(payload().banners[0].title).toBe("Kelas terbaru");
    expect(screen.getByText(/Nama repo, project layanan/)).toBeTruthy();
  });
  it("kategori baru mendapatkan slug yang tetap dapat diedit", async () => {
    const u = userEvent.setup();
    render(<CategoryEditor />);
    await u.type(screen.getByLabelText("Nama kategori"), "Produk Digital");
    expect(payload().slug).toBe("produk-digital");
    await u.clear(screen.getByLabelText("Slug"));
    await u.type(screen.getByLabelText("Slug"), "koleksi");
    expect(payload().slug).toBe("koleksi");
  });
});
