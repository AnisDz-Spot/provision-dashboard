"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/client";
import { createBrowserClient } from "@supabase/ssr";
import { Github, Mail, Loader2 } from "lucide-react";
import { signIn } from "next-auth/react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Remove state for tempSupabaseUrl and modal as we no longer need it
  const supabase = createClient();

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      // Check if 2FA is enabled
      if (data.user && data.session) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("two_factor_enabled")
          .eq("id", data.user.id)
          .single();

        if (profile?.two_factor_enabled) {
          router.push("/auth/verify-2fa");
          return;
        }
      }

      router.push("/dashboard");
      router.refresh();
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  // Remove handleOAuthLogin - only use NextAuth
  // const handleOAuthLogin = async (provider: "github" | "google") => {
  //   // Prevent calling OAuth if app-level Supabase is not configured.
  //   const pubUrl = (process.env.NEXT_PUBLIC_SUPABASE_URL || "").toString();
  //   const pubKey = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "").toString();

  //   if (!pubUrl || !pubKey || pubUrl.includes("your-project-ref") || pubKey.includes("your_anon_public_key")) {
  //     setShowCredsModal(true);
  //     return;
  //   }

  //   setLoading(true);
  //   setError(null);

  //   try {
  //     const { error } = await supabase.auth.signInWithOAuth({
  //       provider,
  //       options: {
  //         redirectTo: `${window.location.origin}/auth/callback`,
  //       },
  //     });

  //     if (error) throw error;
  //   } catch (err: any) {
  //     setError(err.message || "An error occurred");
  //     setLoading(false);
  //   }
  // };

  // const submitTempCredsAndOAuth = async (provider: "github" | "google") => {
  //   setModalError(null);
  //   if (!tempSupabaseUrl || !tempSupabaseApiKey) {
  //     setModalError("Please enter both Supabase URL and API key");
  //     return;
  //   }

  //   try {
  //     // Send creds to server which will set an HTTP-only temp cookie
  //     setModalLoading(true);
  //     const resp = await fetch("/api/temp-supabase-creds", {
  //       method: "POST",
  //       headers: { "Content-Type": "application/json" },
  //       body: JSON.stringify({ url: tempSupabaseUrl, apiKey: tempSupabaseApiKey }),
  //     });

  //     if (!resp.ok) {
  //       const body = await resp.json().catch(() => ({}));
  //       throw new Error(body?.error || "Failed to store temporary credentials");
  //     }

  //     // Create a browser client with provided creds and initiate OAuth
  //     const client = createBrowserClient(tempSupabaseUrl, tempSupabaseApiKey as string);
  //     const { error } = await client.auth.signInWithOAuth({
  //       provider,
  //       options: { redirectTo: `${window.location.origin}/auth/callback` },
  //     });
  //     if (error) throw error;
  //   } catch (err: any) {
  //     setModalError(err.message || "Failed to start OAuth");
  //   } finally {
  //     setModalLoading(false);
  //   }
  // };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex items-center gap-2 mb-4">
            <Image
              src="/provision-logo.png"
              alt="Provision Logo"
              width={40}
              height={40}
              className="rounded-lg"
            />
            <span className="font-bold text-2xl">Provision</span>
          </div>
          <CardTitle className="text-2xl">Welcome back</CardTitle>
          <CardDescription>
            Sign in to your account to continue
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Credentials Modal */}
          {/* {showCredsModal && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <Card className="w-full max-w-md">
                <CardHeader>
                  <CardTitle>Supabase Configuration</CardTitle>
                  <CardDescription>
                    Enter your Supabase project credentials to continue
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {modalError && (
                    <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
                      {modalError}
                    </div>
                  )}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Supabase URL</label>
                    <Input
                      type="text"
                      placeholder="https://your-project.supabase.co"
                      value={tempSupabaseUrl}
                      onChange={(e) => setTempSupabaseUrl(e.target.value)}
                      disabled={modalLoading}
                    />
                  </div>
                  <div className="space-y-2">
                      <label className="text-sm font-medium">Supabase API Key</label>
                      <Input
                        type="password"
                        placeholder="Your API key"
                        value={tempSupabaseApiKey}
                        onChange={(e) => setTempSupabaseApiKey(e.target.value)}
                        disabled={modalLoading}
                      />
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() => {
                        setShowCredsModal(false);
                        setTempSupabaseUrl("");
                        setTempSupabaseApiKey("");
                        setModalError(null);
                      }}
                      disabled={modalLoading}
                    >
                      Cancel
                    </Button>
                    <Button
                      className="flex-1"
                      onClick={() => submitTempCredsAndOAuth("github")}
                      disabled={modalLoading}
                    >
                      {modalLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Configuring...
                        </>
                      ) : (
                        "Continue with GitHub"
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )} */}

          {error && (
            <div className="mb-4 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
              {error}
            </div>
          )}

          <div className="space-y-4">
            {/* App-level NextAuth buttons */}
            <Button
              type="button"
              variant="ghost"
              className="w-full"
              onClick={() => signIn("github", { callbackUrl: `${window.location.origin}/dashboard` })}
              disabled={loading}
            >
              <Github size={18} className="mr-2" />
              Sign in with GitHub (App)
            </Button>

            <Button
              type="button"
              variant="ghost"
              className="w-full"
              onClick={() => signIn("google", { callbackUrl: `${window.location.origin}/dashboard` })}
              disabled={loading}
            >
              <Mail size={18} className="mr-2" />
              Sign in with Google (App)
            </Button>

            {/* Project-level Supabase provider buttons (fallback when app-level providers are not configured) */}
            {/* {handleOAuthLogin("github")} */}
            {/* {handleOAuthLogin("google")} */}

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">
                  Or continue with email
                </span>
              </div>
            </div>

            <form onSubmit={handleEmailLogin} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium">
                  Email
                </label>
                <Input
                  id="email"
                  type="email"
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium">
                  Password
                </label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="remember"
                    className="rounded border-input"
                    disabled={loading}
                  />
                  <label htmlFor="remember" className="text-sm text-muted-foreground">
                    Remember me
                  </label>
                </div>
                <Link
                  href="/forgot-password"
                  className="text-sm text-primary hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
              <Button type="submit" className="w-full" size="lg" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  "Sign in"
                )}
              </Button>
            </form>

            <div className="text-center text-sm text-muted-foreground">
              Don't have an account?{" "}
              <Link href="/register" className="text-primary hover:underline">
                Sign up
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
