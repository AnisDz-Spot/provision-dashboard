"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/client";
import { Shield, Loader2, Copy, Check } from "lucide-react";
import QRCode from "qrcode";
import { authenticator } from "otplib";

export default function Setup2FAPage() {
  const router = useRouter();
  const [step, setStep] = useState<"setup" | "verify">("setup");
  const [qrCode, setQrCode] = useState<string>("");
  const [secret, setSecret] = useState<string>("");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    generateSecret();
  }, []);

  const generateSecret = async () => {
    try {
      // Try to use Supabase function first
      const { data, error } = await supabase.functions.invoke("generate-2fa-secret");

      if (!error && data?.secret) {
        setSecret(data.secret);
        const { data: user } = await supabase.auth.getUser();
        if (user.user) {
          const otpAuthUrl = `otpauth://totp/Provision:${user.user.email}?secret=${data.secret}&issuer=Provision`;
          const qr = await QRCode.toDataURL(otpAuthUrl);
          setQrCode(qr);
        }
        return;
      }
    } catch (err) {
      console.log("Function not available, using client-side generation");
    }

    // Fallback: generate client-side secret
    const fallbackSecret = generateRandomSecret();
    setSecret(fallbackSecret);
    const { data: user } = await supabase.auth.getUser();
    if (user.user) {
      const otpAuthUrl = `otpauth://totp/Provision:${user.user.email}?secret=${fallbackSecret}&issuer=Provision`;
      const qr = await QRCode.toDataURL(otpAuthUrl);
      setQrCode(qr);
    }
  };

  const generateRandomSecret = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
    let secret = "";
    for (let i = 0; i < 32; i++) {
      secret += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return secret;
  };

  const copySecret = () => {
    navigator.clipboard.writeText(secret);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const verifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error("User not found");

      // Verify 2FA code using Supabase function or client-side
      let isValid = false;

      try {
        const { data, error } = await supabase.functions.invoke("verify-2fa", {
          body: { code, secret },
        });

        if (!error && data?.valid) {
          isValid = true;
        }
      } catch (funcError) {
        // Fallback: client-side verification using otplib
        try {
          isValid = authenticator.verify({ token: code, secret: secret });
        } catch (otpError) {
          isValid = false;
        }
      }

      if (isValid) {
        // Enable 2FA for user
        const { error: updateError } = await supabase
          .from("profiles")
          .update({
            two_factor_enabled: true,
            two_factor_secret: secret,
          })
          .eq("id", user.user.id);

        if (updateError) throw updateError;

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
          <CardTitle className="text-2xl text-center">Enable Two-Factor Authentication</CardTitle>
          <CardDescription className="text-center">
            {step === "setup"
              ? "Scan the QR code with your authenticator app"
              : "Enter the verification code from your app"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="mb-4 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
              {error}
            </div>
          )}

          {step === "setup" ? (
            <div className="space-y-4">
              <div className="flex justify-center">
                {qrCode ? (
                  <img src={qrCode} alt="QR Code" className="border rounded-lg p-2" />
                ) : (
                  <div className="h-48 w-48 bg-muted rounded-lg flex items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Or enter this code manually:</label>
                <div className="flex items-center gap-2">
                  <Input
                    value={secret}
                    readOnly
                    className="font-mono text-sm"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={copySecret}
                  >
                    {copied ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              <Button
                className="w-full"
                onClick={() => setStep("verify")}
              >
                I've scanned the code
              </Button>
            </div>
          ) : (
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
                />
                <p className="text-xs text-muted-foreground text-center">
                  Enter the 6-digit code from your authenticator app
                </p>
              </div>

              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => setStep("setup")}
                  disabled={loading}
                >
                  Back
                </Button>
                <Button type="submit" className="flex-1" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    "Verify & Enable"
                  )}
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

