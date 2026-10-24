"use client";
import { useActionState, useState } from "react";
import { saveSettings } from "@/app/actions";
import { type StoreSettings } from "@/lib/catalog";
import { Upload } from "./upload";
export function SettingsEditor({ initial }: { initial: StoreSettings }) {
  const [s, setS] = useState(initial);
  const [state, action, pending] = useActionState(saveSettings, { error: "" });
  function patch<K extends keyof StoreSettings>(
    key: K,
    value: StoreSettings[K],
  ) {
    setS((prev) => ({ ...prev, [key]: value }));
  }
  return (
    <form action={action} className="stack">
      <input type="hidden" name="payload" value={JSON.stringify(s)} />
      <section className="panel stack">
        <h2>Identitas toko</h2>
        <div className="form-grid">
          <label>
            Nama toko
            <input
              value={s.display_name}
              maxLength={80}
              required
              onChange={(e) => patch("display_name", e.target.value)}
            />
          </label>
          <label>
            Warna aksen
            <input
              type="color"
              value={s.accent_color}
              onChange={(e) => patch("accent_color", e.target.value)}
            />
          </label>
        </div>
        <label>
          Deskripsi
          <textarea
            value={s.description}
            maxLength={20000}
            onChange={(e) => patch("description", e.target.value)}
          />
        </label>
        {(["logo_url", "favicon_url"] as const).map((key) => (
          <div className="item-editor stack" key={key}>
            <label>
              {key === "logo_url" ? "Logo" : "Favicon"}
              <input
                type="url"
                value={s[key]}
                onChange={(e) => patch(key, e.target.value)}
              />
            </label>
            <Upload kind="public" onUploaded={({ url }) => patch(key, url)} />
          </div>
        ))}
        <label>
          Kontak dukungan
          <input
            value={s.support_contact}
            maxLength={500}
            onChange={(e) => patch("support_contact", e.target.value)}
          />
        </label>
        <label>
          FAQ umum
          <textarea
            value={s.general_faq}
            maxLength={20000}
            onChange={(e) => patch("general_faq", e.target.value)}
          />
        </label>
        <label>
          Teks legal / syarat dan privasi
          <textarea
            rows={6}
            value={s.legal_text}
            maxLength={20000}
            onChange={(e) => patch("legal_text", e.target.value)}
          />
        </label>
      </section>
      <section className="panel stack">
        <h2>Banner toko</h2>
        <p className="hint">
          Urutan di sini digunakan beranda toko pada Sprint 2.
        </p>
        {s.banners.map((b, i) => (
          <article className="item-editor stack" key={i}>
            <label>
              Judul banner
              <input
                value={b.title}
                onChange={(e) =>
                  patch(
                    "banners",
                    s.banners.map((a, j) =>
                      j === i ? { ...a, title: e.target.value } : a,
                    ),
                  )
                }
              />
            </label>
            <Upload
              kind="public"
              onUploaded={({ url }) =>
                patch(
                  "banners",
                  s.banners.map((a, j) =>
                    j === i ? { ...a, image_url: url } : a,
                  ),
                )
              }
            />
            <label>
              URL gambar
              <input
                type="url"
                value={b.image_url}
                onChange={(e) =>
                  patch(
                    "banners",
                    s.banners.map((a, j) =>
                      j === i ? { ...a, image_url: e.target.value } : a,
                    ),
                  )
                }
              />
            </label>
            <label>
              URL tujuan
              <input
                type="url"
                value={b.target_url}
                onChange={(e) =>
                  patch(
                    "banners",
                    s.banners.map((a, j) =>
                      j === i ? { ...a, target_url: e.target.value } : a,
                    ),
                  )
                }
              />
            </label>
            <div className="actions">
              <button
                type="button"
                className="secondary"
                disabled={!i}
                onClick={() => {
                  const a = [...s.banners];
                  [a[i - 1], a[i]] = [a[i], a[i - 1]];
                  patch("banners", a);
                }}
              >
                Naik
              </button>
              <button
                type="button"
                className="secondary"
                onClick={() =>
                  patch(
                    "banners",
                    s.banners.filter((_, j) => i !== j),
                  )
                }
              >
                Hapus banner
              </button>
            </div>
          </article>
        ))}
        {s.banners.length < 10 && (
          <button
            className="secondary"
            type="button"
            onClick={() =>
              patch("banners", [
                ...s.banners,
                { title: "", image_url: "", target_url: "" },
              ])
            }
          >
            + Tambah banner
          </button>
        )}
      </section>
      {state.error && (
        <p role="alert" className="notice">
          {state.error}
        </p>
      )}
      <button disabled={pending}>
        {pending ? "Menyimpan…" : "Simpan pengaturan"}
      </button>
      <p className="hint">
        Nama repo, project layanan, domain dan endpoint tidak berubah saat nama
        toko diubah.
      </p>
    </form>
  );
}
