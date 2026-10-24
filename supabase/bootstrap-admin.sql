-- Operator only: psql --set=admin_user_id=<verified-auth-user-uuid> --file=supabase/bootstrap-admin.sql
-- Use an authorized MASHURA database connection; never run against BADAI.
\set ON_ERROR_STOP on
begin;
select set_config('mashura.bootstrap_user_id', :'admin_user_id', true);
do $$
declare target uuid:=current_setting('mashura.bootstrap_user_id')::uuid;
begin
 if not exists(select 1 from auth.users where id=target and email_confirmed_at is not null) then
  raise exception 'Verified MASHURA Auth user required';
 end if;
 insert into public.admin_roles(user_id,role) values(target,'business_admin')
 on conflict(user_id,role) do update set revoked_at=null,granted_at=now();
 insert into public.audit_logs(actor_id,action,target_id,details)
 values(target,'role.bootstrap',target::text,'{"role":"business_admin","source":"authorized_database_operator"}');
end $$;
commit;
