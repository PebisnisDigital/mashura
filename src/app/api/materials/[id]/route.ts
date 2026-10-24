import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { z } from "zod";
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { db } = await requireAdmin();
  const { id } = await params;
  if (!z.uuid().safeParse(id).success)
    return NextResponse.json({ error: "Materi tidak valid" }, { status: 400 });
  const { data: m } = await db
    .from("product_materials")
    .select("asset_id")
    .eq("id", id)
    .neq("status", "archived")
    .maybeSingle();
  if (!m?.asset_id)
    return NextResponse.json(
      { error: "File tidak ditemukan" },
      { status: 404 },
    );
  const { data: asset } = await db
    .from("private_assets")
    .select("object_path")
    .eq("id", m.asset_id)
    .single();
  if (!asset)
    return NextResponse.json(
      { error: "File tidak ditemukan" },
      { status: 404 },
    );
  const { data, error } = await db.storage
    .from("paid-materials")
    .createSignedUrl(asset.object_path, 60);
  if (error)
    return NextResponse.json(
      { error: "File belum dapat diakses. Hubungi dukungan." },
      { status: 404 },
    );
  return NextResponse.redirect(data.signedUrl, {
    headers: {
      "Cache-Control": "private, no-store",
      "Referrer-Policy": "no-referrer",
    },
  });
}
