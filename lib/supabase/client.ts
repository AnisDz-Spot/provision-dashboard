"use client";

import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // If env vars are missing (e.g., during build), return a placeholder
  // This allows pages to render without throwing during prerendering
  if (!url || !key) {
    // Return a minimal mock to prevent throws during build
    return {
      auth: {
        resetPasswordForEmail: async () => ({ error: new Error("Supabase not configured") }),
        signUp: async () => ({ data: null, error: new Error("Supabase not configured") }),
        signInWithPassword: async () => ({ data: null, error: new Error("Supabase not configured") }),
        signInWithOAuth: async () => ({ data: null, error: new Error("Supabase not configured") }),
        getUser: async () => ({ data: null, error: new Error("Supabase not configured") }),
        signOut: async () => ({ error: new Error("Supabase not configured") }),
        updateUser: async () => ({ data: null, error: new Error("Supabase not configured") }),
      },
    } as any;
  }

  return createBrowserClient(url, key);
}

