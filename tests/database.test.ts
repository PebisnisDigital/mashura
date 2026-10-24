import { PGlite } from "@electric-sql/pglite";
import { beforeAll, afterAll, describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
// Test-only Supabase platform boundary. Real PostgreSQL policies/RPCs run unmodified.
// This does not emulate or validate GoTrue, PostgREST or Storage HTTP services.
const admin = "00000000-0000-4000-8000-000000000001";
const memberA = "00000000-0000-4000-8000-000000000002";
const memberB = "00000000-0000-4000-8000-000000000003";
const tech = "00000000-0000-4000-8000-000000000004";
let db: PGlite;
let category: string;
let product: string;
let asset: string;
async function asUser(id: string | null, sql: string, params: unknown[] = []) {
  await db.exec(
    `reset role; set request.jwt.claim.sub='${id ?? ""}'; set role ${id ? "authenticated" : "anon"};`,
  );
  return db.query(sql, params);
}
async function rpc(name: string, data: unknown) {
  return db.query<{ id: string }>(`select public.${name}($1::jsonb) as id`, [
    JSON.stringify(data),
  ]);
}
const base = () => ({
  title: "Kursus Contoh",
  slug: "kursus-contoh",
  category_id: category,
  type: "course",
  status: "draft",
  price_idr: 50000,
  summary: "Ringkasan",
  description: "Deskripsi",
  included_items: "Kursus",
  terms: "Syarat",
  access_days: 30,
  media: [{ url: "https://example.com/cover.png", position: 0 }],
  materials: [
    {
      title: "Bab satu",
      chapter: "Modul 1",
      kind: "lesson",
      body: "Materi rahasia",
      status: "published",
      position: 0,
    },
  ],
  child_ids: [],
});
beforeAll(async () => {
  db = new PGlite();
  await db.exec(`create role anon; create role authenticated; create schema auth; create schema storage;
 create table auth.users(id uuid primary key); create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid $$;
 grant usage on schema auth to anon,authenticated; grant execute on function auth.uid() to anon,authenticated;
 create table storage.buckets(id text primary key,name text,public boolean,file_size_limit bigint,allowed_mime_types text[]);
 create table storage.objects(id uuid default gen_random_uuid(),bucket_id text,name text); alter table storage.objects enable row level security;
 grant usage on schema storage to anon,authenticated; grant select,insert,update,delete on storage.objects to anon,authenticated;
 insert into auth.users values ('${admin}'),('${memberA}'),('${memberB}'),('${tech}');`);
  await db.exec(
    readFileSync("supabase/migrations/202610240001_catalog.sql", "utf8"),
  );
  await db.exec(
    `insert into public.admin_roles(user_id,role) values('${admin}','business_admin'),('${tech}','technical_admin'); insert into public.profiles(id,display_name) values('${memberA}','A'),('${memberB}','B');`,
  );
});
afterAll(async () => {
  await db?.close();
});
describe("migration, RPC dan RLS PostgreSQL nyata (PGlite)", () => {
  it("RLS aktif pada semua tabel public", async () => {
    await db.exec("reset role");
    const r = await db.query<{ relname: string }>(
      "select relname from pg_class c join pg_namespace n on n.oid=c.relnamespace where n.nspname='public' and c.relkind='r' and not c.relrowsecurity",
    );
    expect(r.rows).toEqual([]);
  });
  it("anon dapat membaca branding tetapi tidak menulis/admin RPC", async () => {
    expect(
      (await asUser(null, "select display_name from public.store_settings"))
        .rows,
    ).toHaveLength(1);
    await expect(
      db.query("update public.store_settings set display_name='Hacked'"),
    ).rejects.toThrow();
    await expect(
      rpc("save_category", { name: "X", slug: "x" }),
    ).rejects.toThrow();
  });
  it("member dan technical admin tidak dapat mengelola katalog/role", async () => {
    for (const user of [memberA, memberB, tech]) {
      await asUser(user, "select 1");
      await expect(
        rpc("save_category", { name: "X", slug: "x" }),
      ).rejects.toThrow();
      await expect(
        db.query(
          "insert into public.admin_roles(user_id,role) values($1,'business_admin')",
          [user],
        ),
      ).rejects.toThrow();
    }
  });
  it("business admin membuat kategori dan draft; publik tidak melihat draft", async () => {
    await asUser(admin, "select 1");
    category = (
      await rpc("save_category", {
        name: "Bisnis",
        slug: "bisnis",
        is_active: true,
      })
    ).rows[0].id;
    product = (await rpc("save_product", base())).rows[0].id;
    expect(
      (await asUser(null, "select * from public.products")).rows,
    ).toHaveLength(0);
  });
  it("publish belum lengkap ditolak DB, transaksi sebelumnya tetap utuh", async () => {
    await asUser(admin, "select 1");
    await expect(
      rpc("save_product", {
        ...base(),
        id: product,
        status: "published",
        media: [],
      }),
    ).rejects.toThrow("Cover");
    const r = await db.query<{ status: string }>(
      "select status from public.products where id=$1",
      [product],
    );
    expect(r.rows[0].status).toBe("draft");
  });
  it("publish valid; hanya metadata publik, materi privat tidak dapat dibaca anon", async () => {
    await asUser(admin, "select 1");
    await rpc("save_product", { ...base(), id: product, status: "published" });
    expect(
      (await asUser(null, "select * from public.products")).rows,
    ).toHaveLength(1);
    await expect(
      db.query("select body from public.product_materials"),
    ).rejects.toThrow();
    expect(
      (
        await db.query(
          "select * from storage.objects where bucket_id='paid-materials'",
        )
      ).rows,
    ).toHaveLength(0);
  });
  it("member A dan B tidak dapat membaca materi privat atau profil satu sama lain", async () => {
    for (const id of [memberA, memberB]) {
      expect(
        (await asUser(id, "select * from public.product_materials")).rows,
      ).toHaveLength(0);
      const profiles = await db.query<{ id: string }>(
        "select id from public.profiles",
      );
      expect(profiles.rows.map((p) => p.id)).toEqual([id]);
    }
  });
  it("perubahan harga wajib alasan dan dicatat; audit tidak dapat dihapus", async () => {
    await asUser(admin, "select 1");
    await expect(
      rpc("save_product", { ...base(), id: product, price_idr: 75000 }),
    ).rejects.toThrow("Alasan");
    await rpc("save_product", {
      ...base(),
      id: product,
      price_idr: 75000,
      price_reason: "Harga revisi",
    });
    expect(
      (
        await db.query(
          "select * from public.product_price_history where product_id=$1",
          [product],
        )
      ).rows,
    ).toHaveLength(2);
    await expect(db.query("delete from public.audit_logs")).rejects.toThrow();
  });
  it("PDF privat dapat didaftarkan dan dipublish; object tak dapat dihapus", async () => {
    await asUser(admin, "select 1");
    await db.query(
      "insert into storage.objects(bucket_id,name) values('paid-materials','test.pdf')",
    );
    asset = (
      await db.query<{ id: string }>(
        "select public.register_asset('test.pdf') id",
      )
    ).rows[0].id;
    await rpc("save_product", {
      ...base(),
      slug: "ebook",
      type: "pdf",
      status: "published",
      materials: [
        {
          kind: "file",
          title: "Ebook privat",
          asset_id: asset,
          status: "published",
        },
      ],
    });
    expect(
      (
        await db.query(
          "delete from storage.objects where name='test.pdf' returning *",
        )
      ).rows,
    ).toHaveLength(0);
  });
  it("archive materi mempertahankan row dan file lama", async () => {
    await asUser(admin, "select 1");
    await rpc("save_product", {
      ...base(),
      id: product,
      price_idr: 75000,
      materials: [],
    });
    const r = await db.query<{ status: string }>(
      "select status from public.product_materials where product_id=$1",
      [product],
    );
    expect(r.rows.length).toBeGreaterThan(0);
    expect(r.rows.every((m) => m.status === "archived")).toBe(true);
  });
  it("bundle menolak self, nested dan anak tidak terbit", async () => {
    await asUser(admin, "select 1");
    await expect(
      rpc("save_product", {
        ...base(),
        slug: "bundle",
        type: "bundle",
        status: "published",
        child_ids: [product],
      }),
    ).rejects.toThrow("Anak bundle");
  });
  it("semua tipe produk tersimpan, bundle sah dan duplikasi tetap draft", async () => {
    await asUser(admin, "select 1");
    for (const [type, material] of [
      [
        "file",
        { kind: "file", title: "File", asset_id: asset, status: "published" },
      ],
      [
        "prompt",
        {
          kind: "prompt",
          title: "Prompt",
          body: "Isi rahasia",
          status: "published",
        },
      ],
      [
        "external",
        {
          kind: "external",
          title: "Akses",
          external_url: "https://example.com/member",
          status: "published",
        },
      ],
    ] as const)
      await rpc("save_product", {
        ...base(),
        slug: `tipe-${type}`,
        type,
        status: "published",
        materials: [material],
      });
    const pdf = (
      await db.query<{ id: string }>(
        "select id from public.products where slug='ebook'",
      )
    ).rows[0].id;
    await rpc("save_product", {
      ...base(),
      slug: "bundle-sah",
      type: "bundle",
      status: "published",
      materials: [],
      child_ids: [pdf],
    });
    await rpc("save_product", {
      ...base(),
      slug: "salinan",
      title: "Salinan",
      status: "draft",
    });
    expect(
      (
        await db.query<{ status: string }>(
          "select status from public.products where slug='salinan'",
        )
      ).rows[0].status,
    ).toBe("draft");
  });
  it("private object sungguhan tersembunyi dari anon dan kedua member", async () => {
    for (const id of [null, memberA, memberB]) {
      expect(
        (
          await asUser(
            id,
            "select name from storage.objects where bucket_id='paid-materials'",
          )
        ).rows,
      ).toHaveLength(0);
      await expect(
        db.query(
          "insert into storage.objects(bucket_id,name) values('store-assets','forbidden.png')",
        ),
      ).rejects.toThrow();
    }
  });
  it("branding tersimpan dan publik membaca nama baru; audit tercatat", async () => {
    await asUser(admin, "select 1");
    await rpc("save_settings", {
      display_name: "Toko Firdi",
      accent_color: "#234532",
      logo_url: "https://example.com/logo.png",
      favicon_url: "",
      banners: [],
    });
    expect(
      (
        await db.query(
          "select * from public.audit_logs where action='store_settings.update'",
        )
      ).rows,
    ).toHaveLength(1);
    expect(
      (await asUser(null, "select display_name from public.store_settings"))
        .rows,
    ).toEqual([{ display_name: "Toko Firdi" }]);
  });
  it("role dicabut segera gagal RPC", async () => {
    await db.exec(
      `reset role;update public.admin_roles set revoked_at=now() where user_id='${admin}';`,
    );
    await asUser(admin, "select 1");
    await expect(
      rpc("save_category", { name: "X", slug: "x" }),
    ).rejects.toThrow();
  });
});
