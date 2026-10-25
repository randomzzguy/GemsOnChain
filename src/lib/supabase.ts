import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
export const configured = () =>
  !!(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
export async function supabase() {
  if (!configured()) return null;
  const jar = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => jar.getAll(),
        setAll: (values) => {
          try {
            values.forEach(({ name, value, options }) =>
              jar.set(name, value, options),
            );
          } catch {
            /* Read-only server render; actions refresh the session. */
          }
        },
      },
    },
  );
}
export async function requireAdmin() {
  const db = await supabase();
  if (!db) throw new Error("Supabase is not configured.");
  const {
    data: { user },
  } = await db.auth.getUser();
  if (!user) throw new Error("Sign in to continue.");
  const { data, error } = await db.rpc("is_admin");
  if (error || data !== true) throw new Error("Administrator access required.");
  return db;
}
