"use client";
import { useActionState, useState } from "react";
import { saveCategory } from "@/app/actions";
import { type Category, slugify } from "@/lib/catalog";
export function CategoryEditor({ initial }: { initial?: Category }) {
  const [c, setC] = useState(
    initial ?? { name: "", slug: "", is_active: true },
  );
  const [state, action, pending] = useActionState(saveCategory, { error: "" });
  return (
    <form action={action} className="panel stack">
      <input name="payload" type="hidden" value={JSON.stringify(c)} />
      <label>
        Nama kategori
        <input
          value={c.name}
          required
          maxLength={80}
          onChange={(e) =>
            setC((prev) => ({
              ...prev,
              name: e.target.value,
              slug:
                prev.slug === slugify(prev.name)
                  ? slugify(e.target.value)
                  : prev.slug,
            }))
          }
        />
      </label>
      <label>
        Slug
        <input
          value={c.slug}
          required
          onChange={(e) => setC({ ...c, slug: e.target.value })}
        />
      </label>
      <label className="checkbox">
        <input
          type="checkbox"
          checked={c.is_active}
          onChange={(e) => setC({ ...c, is_active: e.target.checked })}
        />
        Kategori aktif
      </label>
      <button disabled={pending}>
        {pending
          ? "Menyimpan…"
          : initial
            ? "Simpan kategori"
            : "Tambah kategori"}
      </button>
      {state.error && (
        <p role="status" className="notice">
          {state.error}
        </p>
      )}
    </form>
  );
}
