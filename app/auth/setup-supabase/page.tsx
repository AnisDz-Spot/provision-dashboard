"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, CheckCircle2, Loader2, ExternalLink } from "lucide-react";

export default function SetupSupabasePage() {
  const router = useRouter();
  const [step, setStep] = useState<"info" | "credentials" | "success">("info");
  const [url, setUrl] = useState("");
  const [anonKey, setAnonKey] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleContinue = async () => {
    if (step === "info") {
      setStep("credentials");
      return;
    }

    if (step === "credentials") {
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

        setStep("success");
      } catch (err: any) {
        setError(err.message || "An error occurred");
      } finally {
        setLoading(false);
      }
    }
  };

  const handleSkip = () => {
    // Skip for now but will be prompted on dashboard
    router.push("/auth/setup-2fa");
  };

  const handleFinish = () => {
    router.push("/auth/setup-2fa");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-lg">
        {step === "info" && (
          <>
            <CardHeader className="space-y-1">
              <div className="flex items-center gap-2 mb-4">
                <div className="h-10 w-10 rounded-lg bg-primary flex items-center justify-center">
                  <span className="text-primary-foreground font-bold text-xl">P</span>
                </div>
                <span className="font-bold text-xl">Provision</span>
              </div>
              <CardTitle className="text-2xl">Set Up Your Database</CardTitle>
              <CardDescription>
                Connect your own Supabase project for your app's data
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex gap-3">
                  <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-medium">Isolated Database</h3>
                    <p className="text-sm text-muted-foreground">
                      Your data is stored in your own Supabase project
                    </p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-medium">Scale as You Grow</h3>
                    <p className="text-sm text-muted-foreground">
                      Upgrade your Supabase plan for more storage and features
                    </p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-medium">Complete Control</h3>
                    <p className="text-sm text-muted-foreground">
                      Manage your data, backups, and security directly
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4 space-y-2">
                <h3 className="font-semibold text-sm">How it works:</h3>
                <ol className="text-sm space-y-1 list-decimal list-inside">
                  <li>Create a free project at Supabase</li>
                  <li>Copy your Project URL and API Key</li>
                  <li>Paste them here</li>
                </ol>
              </div>

              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={handleSkip}
                >
                  Skip for Now
                </Button>
                <Button
                  type="button"
                  className="flex-1"
                  onClick={handleContinue}
                >
                  Next: Add Credentials
                </Button>
              </div>
            </CardContent>
          </>
        )}

        {step === "credentials" && (
          <>
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl">Add Your Supabase Credentials</CardTitle>
              <CardDescription>
                Find these in your Supabase project settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {error && (
                <div className="flex gap-2 p-3 rounded-lg bg-destructive/10 text-destructive">
                  <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <p className="text-sm">{error}</p>
                </div>
              )}

              <div>
                <label className="text-sm font-medium">Supabase Project URL</label>
                <Input
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://your-project-xxxxx.supabase.co"
                  disabled={loading}
                  className="mt-1"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Found in Settings → API → Project URL
                </p>
              </div>

              <div>
                <label className="text-sm font-medium">Anon/Public Key</label>
                <Input
                  value={anonKey}
                  onChange={(e) => setAnonKey(e.target.value)}
                  placeholder="your-anon-public-key"
                  type="password"
                  disabled={loading}
                  className="mt-1"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Found in Settings → API → Project API Keys
                </p>
              </div>

              <a
                href="https://supabase.com/dashboard"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
              >
                Open Supabase Dashboard
                <ExternalLink className="h-4 w-4" />
              </a>

              <div className="flex gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => setStep("info")}
                  disabled={loading}
                >
                  Back
                </Button>
                <Button
                  type="button"
                  className="flex-1"
                  onClick={handleContinue}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save & Continue"
                  )}
                </Button>
              </div>
            </CardContent>
          </>
        )}

        {step === "success" && (
          <>
            <CardHeader className="space-y-1">
              <div className="flex justify-center mb-4">
                <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-950 flex items-center justify-center">
                  <CheckCircle2 className="h-6 w-6 text-green-600" />
                </div>
              </div>
              <CardTitle className="text-2xl text-center">
                Database Connected!
              </CardTitle>
              <CardDescription className="text-center">
                Your Supabase project is now connected
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg p-4">
                <p className="text-sm">
                  ✓ Your data will be stored in your own Supabase project
                </p>
                <p className="text-sm mt-2">
                  ✓ You can upgrade your plan anytime for more resources
                </p>
              </div>

              <p className="text-sm text-muted-foreground">
                Next: Enable Two-Factor Authentication for security
              </p>

              <Button type="button" className="w-full" onClick={handleFinish}>
                Next: Set Up 2FA
              </Button>
            </CardContent>
          </>
        )}
      </Card>
    </div>
  );
}
