import { settings } from "@/lib/data";
import { SettingsEditor } from "@/components/settings-editor";
export default async function Settings({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string }>;
}) {
  const [store, s] = await Promise.all([settings(), searchParams]);
  return (
    <>
      <div className="page-heading">
        <div>
          <p className="eyebrow">IDENTITAS & PENGATURAN</p>
          <h1>Toko Anda, karakter Anda.</h1>
          <p className="muted">
            Ubah tampilan dan informasi toko tanpa deploy ulang.
          </p>
        </div>
      </div>
      {s.saved && (
        <p role="status" className="notice success">
          Pengaturan berhasil disimpan.
        </p>
      )}
      <SettingsEditor initial={store} />
    </>
  );
}
