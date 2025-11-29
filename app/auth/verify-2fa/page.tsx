"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/client";
import { Shield, Loader2 } from "lucide-react";

export default function Verify2FAPage() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  const verifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error("User not found");

      // Get user's 2FA secret
      const { data: profile } = await supabase
        .from("profiles")
        .select("two_factor_secret")
        .eq("id", user.user.id)
        .single();

      if (!profile?.two_factor_secret) {
        throw new Error("2FA not set up. Please set it up first.");
      }

      // Verify 2FA code
      let isValid = false;

      try {
        const { data, error: verifyError } = await supabase.functions.invoke("verify-2fa", {
          body: { code, secret: profile.two_factor_secret },
        });

        if (!verifyError && data?.valid) {
          isValid = true;
        }
      } catch (funcError) {
        // Fallback: client-side verification
        const { authenticator } = await import("otplib");
        try {
          isValid = authenticator.verify({ token: code, secret: profile.two_factor_secret });
        } catch (otpError) {
          isValid = false;
        }
      }

      if (isValid) {
        // Store 2FA verification in session
        await supabase.auth.updateUser({
          data: { two_factor_verified: true },
        });

        router.push("/dashboard");
        router.refresh();
      } else {
        setError("Invalid code. Please try again.");
      }
    } catch (err: any) {
      setError(err.message || "Verification failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-center mb-4">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Shield className="h-6 w-6 text-primary" />
            </div>
          </div>
          <CardTitle className="text-2xl text-center">Two-Factor Authentication</CardTitle>
          <CardDescription className="text-center">
            Enter the verification code from your authenticator app
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="mb-4 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
              {error}
            </div>
          )}

          <form onSubmit={verifyCode} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="code" className="text-sm font-medium">
                Verification Code
              </label>
              <Input
                id="code"
                type="text"
                placeholder="000000"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                maxLength={6}
                required
                disabled={loading}
                className="text-center text-2xl font-mono tracking-widest"
                autoFocus
              />
              <p className="text-xs text-muted-foreground text-center">
                Enter the 6-digit code from your authenticator app
              </p>
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Verifying...
                </>
              ) : (
                "Verify"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

