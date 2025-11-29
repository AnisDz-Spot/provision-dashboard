import { createClient as createServerClient } from "@/lib/supabase/server";
import { getUserKeys } from "@/lib/supabase/secure-store";
import { createClient } from "@supabase/supabase-js";

/**
 * Get the user's own Supabase client (created with their stored credentials)
 * If user hasn't configured their Supabase project, returns null
 */
export async function getUserSupabaseClient() {
  try {
    // Get authenticated user
    const supabase = await createServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return null;

    // Fetch user's stored Supabase credentials
    const keys = await getUserKeys(user.id);
    if (!keys || !keys.url || !keys.anonKey) return null;

    // Create client with user's credentials
    const userClient = createClient(keys.url, keys.anonKey);
    return userClient;
  } catch (err) {
    console.error("Failed to create user Supabase client:", err);
    return null;
  }
}

/**
 * Get both the authenticated session and user's Supabase client
 * Useful for API routes that need both
 */
export async function getUserContextWithSupabaseClient() {
  try {
    const supabase = await createServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return { user: null, userClient: null };

    const userClient = await getUserSupabaseClient();
    return { user, userClient };
  } catch (err) {
    console.error("Failed to get user context:", err);
    return { user: null, userClient: null };
  }
}
