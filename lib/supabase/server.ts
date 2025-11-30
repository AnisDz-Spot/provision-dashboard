import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * Create a Supabase server client using the user's credentials from session/db.
 * @param userSupabaseUrl - The user's Supabase project URL
 * @param userSupabaseKey - The user's Supabase Anon Key
 */
export async function createClient(userSupabaseUrl: string, userSupabaseKey: string) {
  const cookieStore = await cookies();
  return createServerClient(userSupabaseUrl, userSupabaseKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {}
      },
    },
  });
}


