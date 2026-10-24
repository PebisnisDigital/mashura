-- MASHURA Sprint 1. No payment, membership delivery or BADAI resources.
create schema if not exists private;
revoke all on schema private from public;
grant usage on schema private to anon,authenticated;

create table public.admin_roles (
 user_id uuid references auth.users(id) on delete cascade,
 role text not null check(role in ('business_admin','technical_admin')),
 granted_at timestamptz not null default now(), revoked_at timestamptz,
 primary key(user_id,role)
);
alter table public.admin_roles enable row level security;
create function private.is_business_admin() returns boolean
language sql stable security definer set search_path = '' as $$
 select exists(select 1 from public.admin_roles where user_id = auth.uid() and role='business_admin' and revoked_at is null)
$$;
revoke all on function private.is_business_admin() from public;
grant execute on function private.is_business_admin() to anon,authenticated;
create policy own_role on public.admin_roles for select to authenticated using(user_id=auth.uid());

create table public.profiles (
 id uuid primary key references auth.users(id) on delete cascade,
 display_name text not null default '', whatsapp text not null default ''
);
alter table public.profiles enable row level security;
create policy own_profile on public.profiles for select to authenticated using(id=auth.uid() or private.is_business_admin());
-- Profile writes intentionally unavailable until membership Sprint 4.

create table public.store_settings (
 id boolean primary key default true check(id),
 display_name text not null default 'MASHURA' check(length(display_name) between 1 and 80),
 description text not null default '', logo_url text not null default '', favicon_url text not null default '',
 accent_color text not null default '#34584a' check(accent_color ~ '^#[0-9a-fA-F]{6}$'),
 support_contact text not null default '', general_faq text not null default '', legal_text text not null default '',
 banners jsonb not null default '[]' check(jsonb_typeof(banners)='array'), updated_at timestamptz not null default now()
);
insert into public.store_settings(id) values(true);
alter table public.store_settings enable row level security;
create policy public_settings on public.store_settings for select to anon,authenticated using(true);

create table public.categories (
 id uuid primary key default gen_random_uuid(), name text not null check(length(name) between 1 and 80),
 slug text not null unique check(slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'), is_active boolean not null default true
);
alter table public.categories enable row level security;
create policy categories_read on public.categories for select to anon,authenticated using(is_active or (select auth.uid()) is not null and private.is_business_admin());

create table public.products (
 id uuid primary key default gen_random_uuid(), sku text not null unique default gen_random_uuid()::text,
 slug text not null unique check(slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
 category_id uuid references public.categories(id), title text not null check(length(title) between 1 and 160),
 type text not null check(type in ('course','pdf','file','prompt','external','bundle')),
 status text not null default 'draft' check(status in ('draft','published','inactive')),
 price_idr bigint not null default 0 check(price_idr>=0 and price_idr<=1000000000),
 summary text not null default '', description text not null default '', benefits text not null default '',
 included_items text not null default '', requirements text not null default '', faq text not null default '', terms text not null default '',
 access_days integer check(access_days in (30,365)),
 is_featured boolean not null default false, featured_position integer not null default 0,
 created_at timestamptz not null default now(), updated_at timestamptz not null default now(), published_at timestamptz
);
create index products_status_category on public.products(status,category_id);
alter table public.products enable row level security;
create policy products_read on public.products for select to anon,authenticated using(status='published' or (select auth.uid()) is not null and private.is_business_admin());

create table public.product_media (
 id uuid primary key default gen_random_uuid(), product_id uuid not null references public.products(id) on delete cascade,
 url text not null, alt_text text not null default '', position integer not null default 0
);
alter table public.product_media enable row level security;
create policy media_read on public.product_media for select to anon,authenticated using(exists(select 1 from public.products p where p.id=product_id));

create table public.private_assets (
 id uuid primary key default gen_random_uuid(), object_path text not null unique,
 created_at timestamptz not null default now()
);
alter table public.private_assets enable row level security;
create policy assets_admin on public.private_assets for select to authenticated using(private.is_business_admin());

create table public.product_materials (
 id uuid primary key default gen_random_uuid(), product_id uuid not null references public.products(id) on delete cascade,
 chapter text not null default '', title text not null, kind text not null check(kind in ('lesson','file','prompt','external')),
 body text not null default '', video_url text not null default '', external_url text not null default '',
 asset_id uuid references public.private_assets(id), position integer not null default 0,
 status text not null default 'draft' check(status in ('draft','published','archived'))
);
create index materials_product on public.product_materials(product_id,position);
alter table public.product_materials enable row level security;
create policy materials_admin on public.product_materials for select to authenticated using(private.is_business_admin());

create table public.bundle_items (
 bundle_product_id uuid references public.products(id) on delete cascade,
 child_product_id uuid references public.products(id) on delete restrict,
 primary key(bundle_product_id,child_product_id), check(bundle_product_id<>child_product_id)
);
alter table public.bundle_items enable row level security;
create policy bundle_admin on public.bundle_items for select to authenticated using(private.is_business_admin());

create table public.product_price_history (
 id uuid primary key default gen_random_uuid(), product_id uuid not null references public.products(id),
 old_price_idr bigint, new_price_idr bigint not null, actor_id uuid not null references auth.users(id),
 reason text not null, changed_at timestamptz not null default now()
);
alter table public.product_price_history enable row level security;
create policy prices_admin on public.product_price_history for select to authenticated using(private.is_business_admin());

create table public.audit_logs (
 id uuid primary key default gen_random_uuid(), actor_id uuid references auth.users(id),
 action text not null, target_id text not null, details jsonb not null default '{}', created_at timestamptz not null default now()
);
alter table public.audit_logs enable row level security;
create policy audit_admin on public.audit_logs for select to authenticated using(private.is_business_admin());

-- All writes use checked transactional RPCs, not general table CRUD. No self role assignment.
revoke all on public.admin_roles,public.profiles,public.store_settings,public.categories,public.products,public.product_media,public.private_assets,public.product_materials,public.bundle_items,public.product_price_history,public.audit_logs from anon,authenticated;
grant select on public.store_settings,public.categories,public.products,public.product_media to anon,authenticated;
grant select on public.admin_roles,public.profiles,public.private_assets,public.product_materials,public.bundle_items,public.product_price_history,public.audit_logs to authenticated;

create function private.require_admin() returns void language plpgsql security definer set search_path='' as $$
begin
 if not private.is_business_admin() then raise exception 'Akses admin bisnis diperlukan' using errcode='42501'; end if;
end $$;
revoke all on function private.require_admin() from public,anon,authenticated;

create function private.safe_url(value text) returns boolean language sql immutable set search_path='' as $$
 select value = '' or (value ~ '^https?://' and length(value)<=2048)
$$;
revoke all on function private.safe_url(text) from public;

create function public.save_settings(data jsonb) returns void language plpgsql security definer set search_path='' as $$
begin
 perform private.require_admin();
 if not private.safe_url(coalesce(data->>'logo_url','')) or not private.safe_url(coalesce(data->>'favicon_url','')) then raise exception 'URL aset tidak valid'; end if;
 if jsonb_array_length(coalesce(data->'banners','[]'))>10 then raise exception 'Maksimal 10 banner'; end if;
 if exists(select 1 from jsonb_array_elements(coalesce(data->'banners','[]')) b where not private.safe_url(b->>'image_url') or not private.safe_url(b->>'target_url')) then raise exception 'URL banner tidak valid'; end if;
 update public.store_settings set display_name=data->>'display_name', description=coalesce(data->>'description',''),logo_url=coalesce(data->>'logo_url',''),favicon_url=coalesce(data->>'favicon_url',''),accent_color=data->>'accent_color',support_contact=coalesce(data->>'support_contact',''),general_faq=coalesce(data->>'general_faq',''),legal_text=coalesce(data->>'legal_text',''),banners=coalesce(data->'banners','[]'),updated_at=now() where id;
 insert into public.audit_logs(actor_id,action,target_id) values(auth.uid(),'store_settings.update','store');
end $$;

create function public.save_category(data jsonb) returns uuid language plpgsql security definer set search_path='' as $$
declare cid uuid:=coalesce(nullif(data->>'id','')::uuid,gen_random_uuid());
begin
 perform private.require_admin();
 insert into public.categories(id,name,slug,is_active) values(cid,data->>'name',data->>'slug',coalesce((data->>'is_active')::boolean,true))
 on conflict(id) do update set name=excluded.name,slug=excluded.slug,is_active=excluded.is_active;
 insert into public.audit_logs(actor_id,action,target_id) values(auth.uid(),'category.save',cid::text);
 return cid;
end $$;

create function public.register_asset(path text) returns uuid language plpgsql security definer set search_path='' as $$
declare aid uuid;
begin
 perform private.require_admin();
 if not exists(select 1 from storage.objects where bucket_id='paid-materials' and name=path) then raise exception 'File privat tidak ditemukan'; end if;
 insert into public.private_assets(object_path) values(path) on conflict(object_path) do update set object_path=excluded.object_path returning id into aid;
 insert into public.audit_logs(actor_id,action,target_id) values(auth.uid(),'asset.register',aid::text);
 return aid;
end $$;

create function public.save_product(data jsonb) returns uuid language plpgsql security definer set search_path='' as $$
declare previous_assets jsonb; pid uuid:=coalesce(nullif(data->>'id','')::uuid,gen_random_uuid()); prev public.products; m jsonb; item jsonb; newstatus text:=data->>'status'; price bigint:=(data->>'price_idr')::bigint;
begin
 perform private.require_admin();
 -- Serialize catalogue writes so bundle validation and child changes cannot race.
 perform pg_advisory_xact_lock(20261024);
 select * into prev from public.products where id=pid for update;
 if prev.id is not null and prev.price_idr<>price and length(trim(coalesce(data->>'price_reason','')))<3 then raise exception 'Alasan perubahan harga wajib diisi'; end if;
 if jsonb_array_length(coalesce(data->'materials','[]'))>100 or jsonb_array_length(coalesce(data->'media','[]'))>12 then raise exception 'Terlalu banyak materi atau gambar'; end if;
 if data->>'type'='bundle' and exists(select 1 from public.bundle_items where child_product_id=pid) then raise exception 'Produk anak bundle tidak bisa diubah menjadi bundle'; end if;
 if newstatus='published' then
   if nullif(trim(data->>'description'),'') is null or nullif(trim(data->>'summary'),'') is null or nullif(data->>'category_id','') is null or nullif(trim(data->>'terms'),'') is null or nullif(trim(data->>'included_items'),'') is null then raise exception 'Lengkapi deskripsi, ringkasan, kategori, isi produk dan ketentuan sebelum publish'; end if;
   if not exists(select 1 from public.categories where id=(data->>'category_id')::uuid and is_active) then raise exception 'Kategori aktif wajib dipilih'; end if;
   if jsonb_array_length(coalesce(data->'media','[]'))=0 then raise exception 'Cover wajib sebelum publish'; end if;
   if data->>'type'='bundle' then
    if jsonb_array_length(coalesce(data->'child_ids','[]'))=0 then raise exception 'Pilih produk anak bundle'; end if;
   elsif not exists(select 1 from jsonb_array_elements(coalesce(data->'materials','[]')) x where x->>'status'='published') then raise exception 'Materi terbit wajib sebelum publish'; end if;
   if data->>'type'='course' and not exists(select 1 from jsonb_array_elements(coalesce(data->'materials','[]')) x where x->>'kind'='lesson' and x->>'status'='published') then raise exception 'Kursus membutuhkan pelajaran terbit'; end if;
 end if;
 insert into public.products(id,slug,category_id,title,type,status,price_idr,summary,description,benefits,included_items,requirements,faq,terms,access_days,is_featured,featured_position,published_at)
 values(pid,data->>'slug',nullif(data->>'category_id','')::uuid,data->>'title',data->>'type',newstatus,price,coalesce(data->>'summary',''),coalesce(data->>'description',''),coalesce(data->>'benefits',''),coalesce(data->>'included_items',''),coalesce(data->>'requirements',''),coalesce(data->>'faq',''),coalesce(data->>'terms',''),nullif(data->>'access_days','')::integer,coalesce((data->>'is_featured')::boolean,false),coalesce((data->>'featured_position')::integer,0),case when newstatus='published' then coalesce(prev.published_at,now()) else prev.published_at end)
 on conflict(id) do update set slug=excluded.slug,category_id=excluded.category_id,title=excluded.title,type=excluded.type,status=excluded.status,price_idr=excluded.price_idr,summary=excluded.summary,description=excluded.description,benefits=excluded.benefits,included_items=excluded.included_items,requirements=excluded.requirements,faq=excluded.faq,terms=excluded.terms,access_days=excluded.access_days,is_featured=excluded.is_featured,featured_position=excluded.featured_position,published_at=excluded.published_at,updated_at=now();
 delete from public.product_media where product_id=pid;
 for item in select * from jsonb_array_elements(coalesce(data->'media','[]')) loop
   if not private.safe_url(item->>'url') or nullif(item->>'url','') is null then raise exception 'URL gambar tidak valid'; end if;
   insert into public.product_media(product_id,url,alt_text,position) values(pid,item->>'url',coalesce(item->>'alt_text',''),coalesce((item->>'position')::int,0));
 end loop;
 select coalesce(jsonb_agg(asset_id),'[]'::jsonb) into previous_assets from public.product_materials where product_id=pid and asset_id is not null;
 -- Archived rows and immutable objects preserve references on material removal.
 update public.product_materials set status='archived' where product_id=pid;
 for m in select * from jsonb_array_elements(coalesce(data->'materials','[]')) loop
   if not private.safe_url(coalesce(m->>'video_url','')) or not private.safe_url(coalesce(m->>'external_url','')) then raise exception 'URL materi tidak valid'; end if;
   if m->>'status'='published' then
    if nullif(trim(m->>'title'),'') is null then raise exception 'Judul materi wajib'; end if;
    if m->>'kind'='file' and nullif(m->>'asset_id','') is null then raise exception 'File privat wajib diunggah'; end if;
    if m->>'kind'='prompt' and nullif(trim(m->>'body'),'') is null then raise exception 'Isi prompt wajib'; end if;
    if m->>'kind'='external' and nullif(m->>'external_url','') is null then raise exception 'Tautan eksternal wajib'; end if;
    if m->>'kind'='lesson' and nullif(trim(m->>'body'),'') is null and nullif(m->>'video_url','') is null then raise exception 'Isi pelajaran wajib'; end if;
    if data->>'type' in ('pdf','file') and m->>'kind'<>'file' or data->>'type'='course' and m->>'kind' not in ('lesson','file') or data->>'type'='prompt' and m->>'kind'<>'prompt' or data->>'type'='external' and m->>'kind'<>'external' then raise exception 'Jenis materi tidak sesuai produk'; end if;
   end if;
   if nullif(m->>'id','') is not null and exists(select 1 from public.product_materials where id=(m->>'id')::uuid and product_id<>pid) then raise exception 'Materi bukan milik produk'; end if;
   insert into public.product_materials(id,product_id,chapter,title,kind,body,video_url,external_url,asset_id,position,status) values(coalesce(nullif(m->>'id','')::uuid,gen_random_uuid()),pid,coalesce(m->>'chapter',''),coalesce(m->>'title',''),m->>'kind',coalesce(m->>'body',''),coalesce(m->>'video_url',''),coalesce(m->>'external_url',''),nullif(m->>'asset_id','')::uuid,coalesce((m->>'position')::int,0),m->>'status') on conflict(id) do update set chapter=excluded.chapter,title=excluded.title,kind=excluded.kind,body=excluded.body,video_url=excluded.video_url,external_url=excluded.external_url,asset_id=excluded.asset_id,position=excluded.position,status=excluded.status;
 end loop;
 delete from public.bundle_items where bundle_product_id=pid;
 if data->>'type'='bundle' then
  for item in select * from jsonb_array_elements(coalesce(data->'child_ids','[]')) loop
   if not exists(select 1 from public.products where id=(item#>>'{}')::uuid and id<>pid and type<>'bundle' and (newstatus<>'published' or status='published')) then raise exception 'Anak bundle harus produk non-bundle yang sah/terbit'; end if;
   insert into public.bundle_items values(pid,(item#>>'{}')::uuid);
  end loop;
 end if;
 if prev.id is null or prev.price_idr<>price then
 insert into public.product_price_history(product_id,old_price_idr,new_price_idr,actor_id,reason) values(pid,prev.price_idr,price,auth.uid(),coalesce(nullif(data->>'price_reason',''),'Harga awal'));
 end if;
 insert into public.audit_logs(actor_id,action,target_id,details) values(auth.uid(),'product.save',pid::text,jsonb_build_object('status',newstatus,'price_changed',prev.price_idr is distinct from price,'asset_ids_before',previous_assets,'asset_ids_after',(select coalesce(jsonb_agg(asset_id),'[]'::jsonb) from public.product_materials where product_id=pid and status<>'archived' and asset_id is not null)));
 return pid;
end $$;

revoke execute on function public.save_settings(jsonb),public.save_category(jsonb),public.register_asset(text),public.save_product(jsonb) from public,anon,authenticated;
grant execute on function public.save_settings(jsonb),public.save_category(jsonb),public.register_asset(text),public.save_product(jsonb) to authenticated;

insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types) values
 ('store-assets','store-assets',true,3145728,array['image/png','image/jpeg','image/webp','image/x-icon']),
 ('paid-materials','paid-materials',false,3145728,array['application/pdf','application/zip','text/plain','application/vnd.openxmlformats-officedocument.wordprocessingml.document','application/vnd.openxmlformats-officedocument.spreadsheetml.sheet','application/vnd.openxmlformats-officedocument.presentationml.presentation']);
create policy public_store_assets on storage.objects for select to anon,authenticated using(bucket_id='store-assets');
create policy admin_storage_insert on storage.objects for insert to authenticated with check(bucket_id in ('store-assets','paid-materials') and private.is_business_admin());
create policy admin_private_read on storage.objects for select to authenticated using(bucket_id='paid-materials' and private.is_business_admin());
-- No UPDATE/DELETE policies: immutable objects prevent accidental buyer file replacement/deletion.
