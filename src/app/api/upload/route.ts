import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { inspectUpload, MAX_UPLOAD } from "@/lib/uploads";
export async function POST(request: NextRequest) {
  if (request.headers.get("origin") !== request.nextUrl.origin)
    return NextResponse.json(
      { error: "Origin tidak diizinkan" },
      { status: 403 },
    );
  const { db, user } = await requireAdmin();
  if (Number(request.headers.get("content-length") ?? 0) > MAX_UPLOAD + 65536)
    return NextResponse.json({ error: "Maksimal file 3 MB" }, { status: 413 });
  try {
    const form = await request.formData();
    const file = form.get("file");
    const kind = form.get("kind");
    if (!(file instanceof File) || (kind !== "public" && kind !== "private"))
      return NextResponse.json(
        { error: "Data upload tidak valid" },
        { status: 400 },
      );
    if (file.size > MAX_UPLOAD)
      return NextResponse.json(
        { error: "Maksimal file 3 MB" },
        { status: 413 },
      );
    const bytes = new Uint8Array(await file.arrayBuffer());
    const info = inspectUpload(file.name, bytes, kind);
    const path = `${user.id}/${crypto.randomUUID()}.${info.extension}`;
    const bucket = kind === "public" ? "store-assets" : "paid-materials";
    const { error } = await db.storage
      .from(bucket)
      .upload(path, bytes, {
        contentType: info.mime,
        upsert: false,
        cacheControl: kind === "public" ? "3600" : "0",
      });
    if (error)
      return NextResponse.json(
        {
          error: "File gagal diunggah. Periksa koneksi Storage dan izin admin.",
        },
        { status: 400 },
      );
    if (kind === "public")
      return NextResponse.json({
        url: db.storage.from(bucket).getPublicUrl(path).data.publicUrl,
        asset_id: "",
      });
    const { data: asset_id, error: registerError } = await db.rpc(
      "register_asset",
      { path },
    );
    if (registerError)
      return NextResponse.json(
        {
          error:
            "File tersimpan tetapi belum tercatat. Hubungi admin teknis; jangan menghapus file.",
        },
        { status: 400 },
      );
    return NextResponse.json({ url: "", asset_id });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Upload gagal" },
      { status: 400 },
    );
  }
}
