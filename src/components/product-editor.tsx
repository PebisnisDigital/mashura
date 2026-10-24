"use client";
import Link from "next/link";
import { useActionState, useState } from "react";
import { saveProduct } from "@/app/actions";
import {
  type ProductInput,
  type Product,
  type Category,
  type Material,
  productTypes,
  slugify,
} from "@/lib/catalog";
import { Upload } from "./upload";
const tabs = [
  "Informasi",
  "Deskripsi",
  "Materi & akses",
  "Aturan",
  "Preview & publish",
];
export function ProductEditor({
  initial,
  products,
  categories,
}: {
  initial: ProductInput;
  products: Product[];
  categories: Category[];
}) {
  const [p, setP] = useState(initial);
  const [step, setStep] = useState(0);
  const [state, action, pending] = useActionState(saveProduct, { error: "" });
  function patch<K extends keyof ProductInput>(key: K, value: ProductInput[K]) {
    setP((prev) => ({ ...prev, [key]: value }));
  }
  function material(
    index: number,
    key: keyof Material,
    value: string | number,
  ) {
    setP((prev) => ({
      ...prev,
      materials: prev.materials.map((m, i) =>
        i === index ? { ...m, [key]: value } : m,
      ),
    }));
  }
  const field = (
    key:
      | "summary"
      | "description"
      | "benefits"
      | "included_items"
      | "requirements"
      | "faq"
      | "terms",
    label: string,
  ) => (
    <label key={key}>
      {label}
      <textarea
        value={p[key]}
        maxLength={20000}
        rows={key === "description" ? 6 : 3}
        onChange={(e) => patch(key, e.target.value)}
      />
    </label>
  );
  return (
    <>
      <div className="page-heading">
        <div>
          <p className="eyebrow">
            KATALOG / {p.id ? "EDIT PRODUK" : "PRODUK BARU"}
          </p>
          <h1>{p.id ? p.title : "Wujudkan produk Anda."}</h1>
        </div>
        <Link href="/admin/produk" className="button secondary">
          Kembali ke daftar
        </Link>
      </div>
      <nav className="steps" aria-label="Tahap produk">
        {tabs.map((t, i) => (
          <button
            key={t}
            type="button"
            className={i === step ? "active" : "secondary"}
            aria-current={i === step ? "step" : undefined}
            onClick={() => setStep(i)}
          >
            {i + 1}. {t}
          </button>
        ))}
      </nav>
      <form action={action} className="stack">
        <input type="hidden" name="payload" value={JSON.stringify(p)} />
        <section className="panel stack">
          {step === 0 && (
            <>
              <h2>Informasi produk</h2>
              <div className="form-grid">
                <label>
                  Judul
                  <input
                    value={p.title}
                    maxLength={160}
                    onChange={(e) =>
                      setP((prev) => ({
                        ...prev,
                        title: e.target.value,
                        slug:
                          prev.id || prev.slug !== slugify(prev.title)
                            ? prev.slug
                            : slugify(e.target.value),
                      }))
                    }
                  />
                </label>
                <label>
                  Slug
                  <input
                    value={p.slug}
                    onChange={(e) => patch("slug", e.target.value)}
                    maxLength={180}
                  />
                </label>
                <label>
                  Kategori
                  <select
                    value={p.category_id}
                    onChange={(e) => patch("category_id", e.target.value)}
                  >
                    <option value="">Pilih kategori</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                        {!c.is_active ? " (nonaktif)" : ""}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  Tipe produk
                  <select
                    value={p.type}
                    onChange={(e) =>
                      patch("type", e.target.value as ProductInput["type"])
                    }
                  >
                    {Object.entries(productTypes).map(([k, v]) => (
                      <option key={k} value={k}>
                        {v}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  Harga (Rp)
                  <input
                    type="number"
                    min={0}
                    max={1000000000}
                    step={1}
                    value={p.price_idr}
                    onChange={(e) => patch("price_idr", Number(e.target.value))}
                  />
                </label>
                {p.id && (
                  <label>
                    Alasan perubahan harga
                    <input
                      value={p.price_reason}
                      maxLength={500}
                      onChange={(e) => patch("price_reason", e.target.value)}
                      placeholder="Wajib jika harga diubah"
                    />
                  </label>
                )}
              </div>
              <h3>Cover & galeri</h3>
              <p className="hint">
                Gambar pertama menjadi cover. Gunakan tombol urutan untuk
                mengatur galeri.
              </p>
              <Upload
                kind="public"
                onUploaded={({ url }) =>
                  patch("media", [
                    ...p.media,
                    { url, alt_text: p.title, position: p.media.length },
                  ])
                }
              />
              {p.media.map((m, i) => (
                <div key={i} className="item-editor">
                  <label>
                    URL gambar {i + 1}
                    <input
                      value={m.url}
                      onChange={(e) =>
                        patch(
                          "media",
                          p.media.map((a, j) =>
                            j === i ? { ...a, url: e.target.value } : a,
                          ),
                        )
                      }
                    />
                  </label>
                  <label>
                    Teks alternatif
                    <input
                      value={m.alt_text}
                      onChange={(e) =>
                        patch(
                          "media",
                          p.media.map((a, j) =>
                            j === i ? { ...a, alt_text: e.target.value } : a,
                          ),
                        )
                      }
                    />
                  </label>
                  <div className="actions">
                    <button
                      type="button"
                      className="secondary"
                      disabled={i === 0}
                      onClick={() => {
                        const a = [...p.media];
                        [a[i - 1], a[i]] = [a[i], a[i - 1]];
                        patch(
                          "media",
                          a.map((x, j) => ({ ...x, position: j })),
                        );
                      }}
                    >
                      Naik
                    </button>
                    <button
                      type="button"
                      className="secondary"
                      onClick={() =>
                        patch(
                          "media",
                          p.media
                            .filter((_, j) => j !== i)
                            .map((a, j) => ({ ...a, position: j })),
                        )
                      }
                    >
                      Lepas dari galeri
                    </button>
                  </div>
                </div>
              ))}
              {p.media.length < 12 && (
                <button
                  type="button"
                  className="secondary"
                  onClick={() =>
                    patch("media", [
                      ...p.media,
                      { url: "", alt_text: "", position: p.media.length },
                    ])
                  }
                >
                  + URL gambar
                </button>
              )}
            </>
          )}
          {step === 1 && (
            <>
              <h2>Jelaskan manfaatnya.</h2>
              {field("summary", "Ringkasan singkat")}
              {field("description", "Deskripsi lengkap")}
              {field("benefits", "Manfaat")}
              {field("included_items", "Apa yang didapat")}
              {field("requirements", "Persyaratan perangkat / akun")}
              {field("faq", "FAQ produk")}
            </>
          )}
          {step === 2 && (
            <>
              <h2>Materi & akses</h2>
              <p className="hint">
                Teks disimpan sebagai teks biasa, bukan HTML. File privat hanya
                dapat dipreview admin pada Sprint 1.
              </p>
              {p.type === "bundle" ? (
                <fieldset>
                  <legend>Produk anak bundle</legend>
                  {products
                    .filter((x) => x.type !== "bundle" && x.id !== p.id)
                    .map((x) => (
                      <label className="checkbox" key={x.id}>
                        <input
                          type="checkbox"
                          checked={p.child_ids.includes(x.id)}
                          onChange={(e) =>
                            patch(
                              "child_ids",
                              e.target.checked
                                ? [...p.child_ids, x.id]
                                : p.child_ids.filter((id) => id !== x.id),
                            )
                          }
                        />
                        {x.title} ({x.status})
                      </label>
                    ))}
                </fieldset>
              ) : (
                <>
                  {p.materials.map((m, i) => (
                    <article className="item-editor stack" key={m.id ?? i}>
                      <h3>Materi {i + 1}</h3>
                      <div className="form-grid">
                        <label>
                          Bab / modul
                          <input
                            value={m.chapter}
                            maxLength={160}
                            onChange={(e) =>
                              material(i, "chapter", e.target.value)
                            }
                          />
                        </label>
                        <label>
                          Judul materi
                          <input
                            value={m.title}
                            maxLength={160}
                            onChange={(e) =>
                              material(i, "title", e.target.value)
                            }
                          />
                        </label>
                        <label>
                          Jenis
                          <select
                            value={m.kind}
                            onChange={(e) =>
                              material(i, "kind", e.target.value)
                            }
                          >
                            <option value="lesson">Pelajaran</option>
                            <option value="file">File / PDF / lampiran</option>
                            <option value="prompt">Prompt</option>
                            <option value="external">Tautan eksternal</option>
                          </select>
                        </label>
                        <label>
                          Status materi
                          <select
                            value={m.status}
                            onChange={(e) =>
                              material(i, "status", e.target.value)
                            }
                          >
                            <option value="draft">Draft</option>
                            <option value="published">
                              Terbit (hanya pemilik hak akses)
                            </option>
                          </select>
                        </label>
                      </div>
                      {(m.kind === "lesson" || m.kind === "prompt") && (
                        <label>
                          Isi teks
                          <textarea
                            value={m.body}
                            rows={5}
                            maxLength={20000}
                            onChange={(e) =>
                              material(i, "body", e.target.value)
                            }
                          />
                        </label>
                      )}
                      {m.kind === "lesson" && (
                        <label>
                          URL video penyedia sah
                          <input
                            type="url"
                            value={m.video_url}
                            onChange={(e) =>
                              material(i, "video_url", e.target.value)
                            }
                            placeholder="https://…"
                          />
                        </label>
                      )}
                      {m.kind === "external" && (
                        <label>
                          URL akses eksternal
                          <input
                            type="url"
                            value={m.external_url}
                            onChange={(e) =>
                              material(i, "external_url", e.target.value)
                            }
                          />
                        </label>
                      )}
                      {(m.kind === "file" || m.kind === "lesson") && (
                        <>
                          <Upload
                            kind="private"
                            onUploaded={({ asset_id }) =>
                              material(i, "asset_id", asset_id)
                            }
                          />
                          {m.asset_id && (
                            <p className="notice">
                              File privat terhubung. Upload file baru mengganti
                              referensi setelah disimpan; file lama tetap
                              disimpan.
                            </p>
                          )}
                        </>
                      )}
                      <div className="actions">
                        <button
                          type="button"
                          className="secondary"
                          disabled={i === 0}
                          onClick={() => {
                            const a = [...p.materials];
                            [a[i - 1], a[i]] = [a[i], a[i - 1]];
                            patch(
                              "materials",
                              a.map((x, j) => ({ ...x, position: j })),
                            );
                          }}
                        >
                          Naik
                        </button>
                        <button
                          type="button"
                          className="secondary"
                          onClick={() => {
                            if (
                              window.confirm(
                                "Arsipkan materi ini? File lama tetap disimpan dan tidak dihapus.",
                              )
                            )
                              patch(
                                "materials",
                                p.materials
                                  .filter((_, j) => j !== i)
                                  .map((a, j) => ({ ...a, position: j })),
                              );
                          }}
                        >
                          Arsipkan materi
                        </button>
                      </div>
                    </article>
                  ))}
                  <button
                    className="secondary"
                    type="button"
                    onClick={() =>
                      patch("materials", [
                        ...p.materials,
                        {
                          chapter: "",
                          title: "",
                          kind:
                            p.type === "course"
                              ? "lesson"
                              : p.type === "pdf" || p.type === "file"
                                ? "file"
                                : p.type === "prompt"
                                  ? "prompt"
                                  : "external",
                          body: "",
                          video_url: "",
                          external_url: "",
                          asset_id: "",
                          position: p.materials.length,
                          status: "draft",
                        },
                      ])
                    }
                  >
                    + Tambah materi
                  </button>
                </>
              )}
            </>
          )}
          {step === 3 && (
            <>
              <h2>Aturan & visibilitas</h2>
              <label>
                Durasi akses
                <select
                  value={p.access_days ?? ""}
                  onChange={(e) =>
                    patch(
                      "access_days",
                      e.target.value
                        ? (Number(e.target.value) as 30 | 365)
                        : null,
                    )
                  }
                >
                  <option value="">Selama produk dan layanan tersedia</option>
                  <option value="365">365 hari</option>
                  <option value="30">30 hari</option>
                </select>
              </label>
              {field("terms", "Ketentuan penggunaan")}
              <label className="checkbox">
                <input
                  type="checkbox"
                  checked={p.is_featured}
                  onChange={(e) => patch("is_featured", e.target.checked)}
                />
                Jadikan produk unggulan
              </label>
              <label>
                Urutan unggulan
                <input
                  type="number"
                  min={0}
                  max={10000}
                  value={p.featured_position}
                  onChange={(e) =>
                    patch("featured_position", Number(e.target.value))
                  }
                />
              </label>
            </>
          )}
          {step === 4 && (
            <>
              <h2>Preview & publish</h2>
              <div className="summary">
                <h3>{p.title || "Produk tanpa judul"}</h3>
                <p>{p.summary || "Ringkasan belum diisi."}</p>
                <p>
                  {productTypes[p.type]} · Rp
                  {p.price_idr.toLocaleString("id-ID")} · {p.materials.length}{" "}
                  materi
                </p>
              </div>
              <p className="hint">
                Publish membutuhkan kategori aktif, cover, deskripsi, ringkasan,
                isi produk, ketentuan dan materi terbit / anak bundle yang sah.
              </p>
              {p.id && (
                <div className="actions">
                  <Link
                    href={`/admin/produk/${p.id}/preview`}
                    className="button secondary"
                  >
                    Preview data tersimpan
                  </Link>
                  <Link
                    href={`/admin/produk/${p.id}?duplicate=1`}
                    className="button secondary"
                  >
                    Duplikasi sebagai draft
                  </Link>
                </div>
              )}
              <label>
                Status produk
                <select
                  value={p.status}
                  onChange={(e) =>
                    patch("status", e.target.value as ProductInput["status"])
                  }
                >
                  <option value="draft">Draft</option>
                  <option value="published">Terbit</option>
                  <option value="inactive">Nonaktif / unpublish</option>
                </select>
              </label>
            </>
          )}
        </section>
        {state.error && (
          <p role="alert" className="notice">
            {state.error}
          </p>
        )}
        <div className="savebar">
          <span className="hint">
            {p.status === "published"
              ? "Akan diterbitkan setelah validasi server."
              : "Produk belum ditawarkan ke publik."}
          </span>
          <div className="actions">
            {step > 0 && (
              <button
                type="button"
                className="secondary"
                onClick={() => setStep(step - 1)}
              >
                Kembali
              </button>
            )}
            {step < 4 && (
              <button
                type="button"
                className="secondary"
                onClick={() => setStep(step + 1)}
              >
                Lanjut
              </button>
            )}
            <button disabled={pending}>
              {pending
                ? "Menyimpan…"
                : p.status === "published"
                  ? "Simpan & terbitkan"
                  : "Simpan produk"}
            </button>
          </div>
        </div>
      </form>
    </>
  );
}
