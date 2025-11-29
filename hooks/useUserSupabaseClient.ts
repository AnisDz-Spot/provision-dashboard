import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { SupabaseClient } from "@supabase/supabase-js";

export function useUserSupabaseClient() {
  const [supabase, setSupabase] = useState<SupabaseClient | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadUserClient() {
      try {
        // Fetch user's stored Supabase credentials
        const res = await fetch("/api/user/supabase-keys");
        
        if (!res.ok) {
          setError("Could not load your Supabase credentials");
          setLoading(false);
          return;
        }

        const data = await res.json();
        
        if (!data.url || !data.anonKey) {
          setError("Supabase credentials not configured");
          setLoading(false);
          return;
        }

        // Dynamically create Supabase client with user's credentials
        const { createBrowserClient } = await import("@supabase/ssr");
        const client = createBrowserClient(data.url, data.anonKey);
        setSupabase(client);
        setError(null);
      } catch (err: any) {
        setError(err.message || "Failed to initialize Supabase client");
      } finally {
        setLoading(false);
      }
    }

    loadUserClient();
  }, []);

  return { supabase, loading, error };
}
