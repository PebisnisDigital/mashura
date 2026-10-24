import "server-only";
import { redirect } from "next/navigation";
import { supabase, configured } from "./supabase/server";
export async function requireAdmin() {
  if (!configured()) redirect("/masuk?status=setup");
  const db = await supabase();
  const {
    data: { user },
    error,
  } = await db.auth.getUser();
  if (error || !user) redirect("/masuk");
  const { data: roles, error: roleError } = await db
    .from("admin_roles")
    .select("role")
    .eq("user_id", user.id)
    .eq("role", "business_admin")
    .is("revoked_at", null);
  if (roleError || !roles?.length) redirect("/masuk?status=forbidden");
  return { db, user };
}
