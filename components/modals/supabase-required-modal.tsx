"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AlertCircle, Loader2 } from "lucide-react";

interface SupabaseRequiredModalProps {
  isOpen: boolean;
  onSuccess: () => void;
}

export function SupabaseRequiredModal({ isOpen, onSuccess }: SupabaseRequiredModalProps) {
  const [url, setUrl] = useState("");
  const [anonKey, setAnonKey] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (!url || !anonKey) {
        throw new Error("Please fill in all fields");
      }

      const res = await fetch("/api/user/supabase-keys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url, anonKey }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to save credentials");
      }

      setUrl("");
      setAnonKey("");
      onSuccess();
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-background rounded-lg shadow-lg max-w-md w-full p-6 space-y-4 border">
        <div className="flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-orange-500 mt-0.5 flex-shrink-0" />
          <div>
            <h2 className="text-lg font-semibold">Supabase Configuration Required</h2>
            <p className="text-sm text-muted-foreground mt-1">
              To use the app, you need to connect your Supabase project credentials.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="text-sm font-medium">Supabase URL</label>
            <Input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://your-project.supabase.co"
              disabled={loading}
              className="mt-1"
            />
          </div>

          <div>
            <label className="text-sm font-medium">anon/public Key</label>
            <Input
              value={anonKey}
              onChange={(e) => setAnonKey(e.target.value)}
              placeholder="your-anon-public-key"
              type="password"
              disabled={loading}
              className="mt-1"
            />
          </div>

          {error && (
            <div className="p-2 rounded bg-destructive/10 text-destructive text-sm">
              {error}
            </div>
          )}

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Credentials"
            )}
          </Button>
        </form>

        <p className="text-xs text-muted-foreground text-center">
          Find these values in your{" "}
          <a
            href="https://supabase.com/dashboard"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            Supabase dashboard
          </a>
        </p>
      </div>
    </div>
  );
}
