"use client";
import { useState } from "react";
export function Upload({
  kind,
  onUploaded,
}: {
  kind: "public" | "private";
  onUploaded: (result: { url: string; asset_id: string }) => void;
}) {
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);
  return (
    <label className="upload">
      {kind === "public"
        ? "Unggah gambar (PNG/JPG/WebP/ICO, maks. 3 MB)"
        : "Unggah materi privat (PDF/ZIP/TXT/Office, maks. 3 MB)"}
      <input
        type="file"
        disabled={busy}
        accept={
          kind === "public"
            ? ".png,.jpg,.jpeg,.webp,.ico"
            : ".pdf,.zip,.txt,.docx,.xlsx,.pptx"
        }
        onChange={async (e) => {
          const f = e.target.files?.[0];
          if (!f) return;
          setBusy(true);
          setStatus("Mengunggah…");
          try {
            const form = new FormData();
            form.set("kind", kind);
            form.set("file", f);
            const res = await fetch("/api/upload", {
              method: "POST",
              body: form,
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Upload gagal");
            onUploaded(data);
            setStatus("File tersimpan. Simpan form untuk menghubungkannya.");
          } catch (error) {
            setStatus(error instanceof Error ? error.message : "Upload gagal");
          } finally {
            setBusy(false);
            e.target.value = "";
          }
        }}
      />
      <span role="status" className="hint">
        {status}
      </span>
    </label>
  );
}
