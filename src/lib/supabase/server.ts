import "server-only";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
export { hasMashuraConfig as configured } from "../environment";
import { hasMashuraConfig as configured } from "../environment";
export async function supabase() {
  if (!configured())
    throw new Error(
      "Supabase MASHURA belum dikonfigurasi. Ikuti docs/development.md.",
    );
  const jar = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll: () => jar.getAll(),
        setAll: (items) => {
          try {
            items.forEach(({ name, value, options }) =>
              jar.set(name, value, options),
            );
          } catch {
            /* Read-only Server Component; proxy refreshes cookies. */
          }
        },
      },
    },
  );
}
