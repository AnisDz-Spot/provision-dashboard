"use client";

import { createBrowserClient } from "@supabase/ssr";

/**
 * Create a Supabase browser client using the user's own credentials.
 * @param userSupabaseUrl - The user's Supabase project URL
 * @param userSupabaseKey - The user's Supabase Anon Key
 */
export function createClient(userSupabaseUrl: string, userSupabaseKey: string) {
  if (!userSupabaseUrl || !userSupabaseKey) {
    return {
      auth: {
        resetPasswordForEmail: async () => ({
          error: new Error("Supabase not configured"),
        }),
        signUp: async () => ({
          data: null,
          error: new Error("Supabase not configured"),
        }),
        signInWithPassword: async () => ({
          data: null,
          error: new Error("Supabase not configured"),
        }),
        signInWithOAuth: async () => ({
          data: null,
          error: new Error("Supabase not configured"),
        }),
        getUser: async () => ({
          data: null,
          error: new Error("Supabase not configured"),
        }),
        signOut: async () => ({ error: new Error("Supabase not configured") }),
        updateUser: async () => ({
          data: null,
          error: new Error("Supabase not configured"),
        }),
      },
    } as any;
  }
  return createBrowserClient(userSupabaseUrl, userSupabaseKey);
}

