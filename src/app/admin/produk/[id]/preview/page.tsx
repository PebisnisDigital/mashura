/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { notFound } from "next/navigation";
import { productEditorData } from "@/lib/data";
import { productTypes, rupiah } from "@/lib/catalog";
import { z } from "zod";
export default async function Preview({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  if (!z.uuid().safeParse(id).success) notFound();
  const p = await productEditorData(id);
  if (!p) notFound();
  return (
    <>
      <p className="notice">
        Preview admin · data terakhir disimpan · tidak membuka akses publik.
      </p>
      <Link href={`/admin/produk/${id}`}>← Edit produk</Link>
      <article className="panel stack preview">
        <div className="preview-gallery">
          {p.media.map((m, i) => (
            <img key={i} src={m.url} alt={m.alt_text || p.title} />
          ))}
        </div>
        <p className="eyebrow">
          {productTypes[p.type]} · {p.status}
        </p>
        <h1>{p.title}</h1>
        <strong>{rupiah(p.price_idr)}</strong>
        <p>{p.summary}</p>
        {[
          ["Deskripsi", p.description],
          ["Manfaat", p.benefits],
          ["Apa yang didapat", p.included_items],
          ["Persyaratan", p.requirements],
          ["FAQ", p.faq],
          ["Ketentuan", p.terms],
        ].map(
          ([title, text]) =>
            text && (
              <section key={title}>
                <h2>{title}</h2>
                <p className="pre-wrap">{text}</p>
              </section>
            ),
        )}
        <p>
          Akses:{" "}
          {p.access_days
            ? `${p.access_days} hari`
            : "Selama produk dan layanan tersedia"}
        </p>
        {p.child_ids.length > 0 && (
          <p>Bundle membuka {p.child_ids.length} produk anak.</p>
        )}
        <h2>Materi privat (preview admin)</h2>
        {p.materials.map((m, i) => (
          <section className="item-editor" key={m.id ?? i}>
            <span className="hint">
              {m.chapter} · {m.status}
            </span>
            <h3>{m.title}</h3>
            <p className="pre-wrap">{m.body}</p>
            {m.video_url && (
              <a href={m.video_url} target="_blank" rel="noopener noreferrer">
                Buka video penyedia sah ↗
              </a>
            )}
            {m.external_url && (
              <a
                href={m.external_url}
                target="_blank"
                rel="noopener noreferrer"
              >
                Buka tautan akses ↗
              </a>
            )}
            {m.asset_id && m.id && (
              <p>
                <a
                  href={`/api/materials/${m.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Preview file privat (URL singkat) ↗
                </a>
              </p>
            )}
          </section>
        ))}
      </article>
    </>
  );
}
