"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  AlertCircle,
  CheckCircle2,
  Loader2,
  ExternalLink,
  Database,
  Cloud,
} from "lucide-react";

export default function SetupDatabasePage() {
  const router = useRouter();
  const [step, setStep] = useState<"supabase" | "postgres" | "success">("supabase");

  // Supabase form state
  const [supabaseUrl, setSupabaseUrl] = useState("");
  const [supabaseKey, setSupabaseKey] = useState("");
  const [supabaseError, setSupabaseError] = useState<string | null>(null);
  const [supabaseLoading, setSupabaseLoading] = useState(false);

  // PostgreSQL form state
  const [connectionString, setConnectionString] = useState("");
  const [postgresError, setPostgresError] = useState<string | null>(null);
  const [postgresLoading, setPostgresLoading] = useState(false);

  const handleSupabaseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSupabaseError(null);
    setSupabaseLoading(true);

    try {
      if (!supabaseUrl || !supabaseKey) {
        throw new Error("Please enter both Supabase URL and anon key");
      }

      if (!supabaseUrl.includes("supabase.co")) {
        throw new Error("Invalid Supabase URL format");
      }

      if (supabaseKey.length < 20) {
        throw new Error("Invalid anon key - appears too short");
      }

      const response = await fetch("/api/user/supabase-credentials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: supabaseUrl, anonKey: supabaseKey }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to save Supabase credentials");
      }

      setStep("postgres");
    } catch (err: any) {
      setSupabaseError(err.message || "An error occurred");
    } finally {
      setSupabaseLoading(false);
    }
  };

  const handlePostgresSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPostgresError(null);
    setPostgresLoading(true);

    try {
      if (!connectionString) {
        throw new Error("Please enter your PostgreSQL connection string");
      }

      const response = await fetch("/api/user/database-connection", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ connectionString }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to connect to PostgreSQL");
      }

      setStep("success");
    } catch (err: any) {
      setPostgresError(err.message || "An error occurred");
    } finally {
      setPostgresLoading(false);
    }
  };

  const handleComplete = () => {
    router.push("/dashboard");
    router.refresh();
  };

  return (
    <div className="min-h-screen bg-background p-4 py-12">
      <div className="max-w-2xl mx-auto">
        {/* Progress Indicator */}
        <div className="mb-8 flex gap-4">
          <div
            className={`flex-1 h-1 rounded-full transition-colors ${
              step === "supabase" || step === "postgres" || step === "success"
                ? "bg-primary"
                : "bg-muted"
            }`}
          />
          <div
            className={`flex-1 h-1 rounded-full transition-colors ${
              step === "postgres" || step === "success"
                ? "bg-primary"
                : "bg-muted"
            }`}
          />
          <div
            className={`flex-1 h-1 rounded-full transition-colors ${
              step === "success" ? "bg-primary" : "bg-muted"
            }`}
          />
        </div>

        {/* Step 1: Supabase Credentials */}
        {step === "supabase" && (
          <Card>
            <CardHeader className="space-y-1">
              <div className="flex items-center gap-2">
                <Cloud className="w-5 h-5 text-primary" />
                <CardTitle className="text-2xl">Connect Supabase</CardTitle>
              </div>
              <CardDescription>
                Set up authentication for your Provision account
              </CardDescription>
            </CardHeader>
            <CardContent>
              {supabaseError && (
                <div className="mb-4 p-3 rounded-lg bg-destructive/10 text-destructive text-sm flex gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  {supabaseError}
                </div>
              )}

              <form onSubmit={handleSupabaseSubmit} className="space-y-4">
                <div className="bg-muted p-4 rounded-lg space-y-2 mb-6">
                  <p className="text-sm font-semibold">Get Your Credentials:</p>
                  <ol className="text-xs space-y-1 list-decimal list-inside text-muted-foreground">
                    <li>
                      Go to{" "}
                      <a
                        href="https://supabase.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary underline"
                      >
                        supabase.com
                      </a>
                    </li>
                    <li>Create or open a project</li>
                    <li>
                      Go to Settings → API → Copy Project URL and anon key
                    </li>
                    <li>Paste them below</li>
                  </ol>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Supabase Project URL
                  </label>
                  <Input
                    placeholder="https://your-project.supabase.co"
                    value={supabaseUrl}
                    onChange={(e) => setSupabaseUrl(e.target.value)}
                    disabled={supabaseLoading}
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    Example: https://qwerty.supabase.co
                  </p>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Anon Key</label>
                  <Input
                    type="password"
                    placeholder="eyJ... (your anon key)"
                    value={supabaseKey}
                    onChange={(e) => setSupabaseKey(e.target.value)}
                    disabled={supabaseLoading}
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    Your public anon key for authentication
                  </p>
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  size="lg"
                  disabled={supabaseLoading}
                >
                  {supabaseLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Continue to Database Setup"
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Step 2: PostgreSQL Connection */}
        {step === "postgres" && (
          <Card>
            <CardHeader className="space-y-1">
              <div className="flex items-center gap-2">
                <Database className="w-5 h-5 text-primary" />
                <CardTitle className="text-2xl">Connect Database</CardTitle>
              </div>
              <CardDescription>
                Add your PostgreSQL database for storing projects and tasks
              </CardDescription>
            </CardHeader>
            <CardContent>
              {postgresError && (
                <div className="mb-4 p-3 rounded-lg bg-destructive/10 text-destructive text-sm flex gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  {postgresError}
                </div>
              )}

              <form onSubmit={handlePostgresSubmit} className="space-y-4">
                <div className="bg-muted p-4 rounded-lg space-y-3 mb-6">
                  <p className="text-sm font-semibold">
                    Recommended Providers (5 min setup):
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { name: "Neon", url: "https://neon.tech" },
                      { name: "Railway", url: "https://railway.app" },
                      { name: "Render", url: "https://render.com" },
                      { name: "AWS RDS", url: "https://aws.amazon.com/rds/" },
                    ].map((provider) => (
                      <a
                        key={provider.name}
                        href={provider.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-primary hover:underline flex items-center gap-1"
                      >
                        {provider.name}
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    PostgreSQL Connection String
                  </label>
                  <Input
                    type="password"
                    placeholder="postgresql://user:password@host:5432/database"
                    value={connectionString}
                    onChange={(e) => setConnectionString(e.target.value)}
                    disabled={postgresLoading}
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    Format: postgresql://user:password@host:5432/dbname
                  </p>
                </div>

                <div className="space-y-2">
                  <Button
                    type="submit"
                    className="w-full"
                    size="lg"
                    disabled={postgresLoading}
                  >
                    {postgresLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Testing Connection...
                      </>
                    ) : (
                      "Complete Setup"
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={() => setStep("supabase")}
                    disabled={postgresLoading}
                  >
                    Back
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Step 3: Success */}
        {step === "success" && (
          <Card className="border-green-200 bg-green-50 dark:bg-green-950/20">
            <CardHeader className="space-y-1">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-6 h-6 text-green-600" />
                <CardTitle className="text-2xl">All Set!</CardTitle>
              </div>
              <CardDescription>
                Your account is ready to use
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-white dark:bg-slate-900 p-4 rounded-lg space-y-2">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                  <span className="text-sm">Supabase credentials saved</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                  <span className="text-sm">PostgreSQL database connected</span>
                </div>
              </div>

              <p className="text-sm text-muted-foreground">
                Your dashboard is now ready. You can start creating projects and managing tasks!
              </p>

              <Button
                onClick={handleComplete}
                className="w-full"
                size="lg"
              >
                Go to Dashboard
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
