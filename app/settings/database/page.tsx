"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function SettingsDatabasePage() {
  const router = useRouter();
  const [url, setUrl] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!url || !apiKey) {
      setError("Both Supabase Project URL and API Key are required");
      return;
    }

    setLoading(true);

    try {
      const resp = await fetch("/api/user/supabase-credentials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url, apiKey }),
      });

      const body = await resp.json().catch(() => ({}));

      if (!resp.ok) {
        throw new Error(body?.error || "Failed to validate credentials");
      }

      setSuccess("Credentials saved — redirecting to dashboard...");
      // small delay so user sees confirmation
      setTimeout(() => router.push("/dashboard"), 900);
    } catch (err: any) {
      setError(err.message || "An error occurred while validating credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle>Connect your Supabase project</CardTitle>
          <CardDescription>
            To access the dashboard you must provide your Supabase project URL and API key. These credentials are stored encrypted and are only used to perform OAuth and access your project's database.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="mb-4 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">{error}</div>
          )}
          {success && (
            <div className="mb-4 p-3 rounded-lg bg-success/10 text-success text-sm">{success}</div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Supabase Project URL</label>
              <Input
                type="url"
                placeholder="https://your-project-ref.supabase.co"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">API Key</label>
              <Input
                type="password"
                placeholder="Service role or anon key"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            <div className="flex items-center gap-2">
              <Button type="submit" disabled={loading} className="flex-1">
                {loading ? "Validating..." : "Validate & Save"}
              </Button>
              <Button type="button" variant="outline" onClick={() => router.push("/settings")}>
                Cancel
              </Button>
            </div>

            <div className="text-sm text-muted-foreground">
              Note: For full DB access create a service-role key in your Supabase project and paste it here. The key is encrypted before saving.
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
