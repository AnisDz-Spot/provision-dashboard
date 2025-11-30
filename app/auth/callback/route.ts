import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import crypto from "crypto";

function encryptCredentials(url: string, anonKey: string): string {
  const ENCRYPTION_KEY = process.env.SUPABASE_KEYS_ENCRYPTION_KEY || "";
  if (!ENCRYPTION_KEY || ENCRYPTION_KEY.length !== 64) {
    throw new Error(
      "SUPABASE_KEYS_ENCRYPTION_KEY must be set to a 32-byte hex string (64 chars)"
    );
  }

  const iv = crypto.randomBytes(12);
  const encKey = Buffer.from(ENCRYPTION_KEY, "hex");
  const cipher = crypto.createCipheriv("aes-256-gcm", encKey, iv);

  const data = JSON.stringify({ url, anonKey });
  let encrypted = cipher.update(data, "utf-8", "hex");
  encrypted += cipher.final("hex");

  const authTag = cipher.getAuthTag();
  return `${iv.toString("hex")}:${authTag.toString("hex")}:${encrypted}`;
}

function readCredentialsFile(): Record<string, string> {
  try {
    const fs = require("fs");
    const file = "data/user-supabase-credentials.json";
    if (fs.existsSync(file)) {
      return JSON.parse(fs.readFileSync(file, "utf-8"));
    }
  } catch (err) {
    console.error("readCredentialsFile error:", err);
  }
  return {};
}

function writeCredentialsFile(data: Record<string, string>) {
  try {
    const fs = require("fs");
    const path = require("path");
    const file = "data/user-supabase-credentials.json";
    const dir = path.dirname(file);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(file, JSON.stringify(data, null, 2));
  } catch (err) {
    console.error("writeCredentialsFile error:", err);
    throw err;
  }
}

function parseCookies(cookieHeader: string | null) {
  if (!cookieHeader) return {};
  return cookieHeader.split(";").map((c) => c.trim()).reduce((acc: Record<string,string>, pair) => {
    const idx = pair.indexOf("=");
    if (idx === -1) return acc;
    const name = pair.slice(0, idx);
    const val = pair.slice(idx + 1);
    acc[name] = decodeURIComponent(val);
    return acc;
  }, {});
}

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard";

  // Check for temp_supabase_creds cookie (set by client when user supplied their own project creds)
  const cookieHeader = request.headers.get("cookie");
  const cookies = parseCookies(cookieHeader);

  try {
    if (code) {
      // If the user provided temporary Supabase creds, use them to complete OAuth and persist
      if (cookies.temp_supabase_creds) {
        const temp = JSON.parse(decodeURIComponent(cookies.temp_supabase_creds));
        const { url: tempUrl, anonKey: tempAnonKey } = temp;

        // Prepare cookie collectors for createServerClient
        const parsedRequestCookies = request.headers.get("cookie") || "";
        const parsed = parsedRequestCookies
          .split(";")
          .map((s) => s.trim())
          .filter(Boolean)
          .map((c) => {
            const idx = c.indexOf("=");
            const name = c.slice(0, idx);
            const value = c.slice(idx + 1);
            return { name, value };
          });

        const cookiesToSet: Array<any> = [];

        const supabase = createServerClient(tempUrl, tempAnonKey, {
          cookies: {
            getAll() {
              return parsed;
            },
            setAll(items: any[]) {
              items.forEach((it) => cookiesToSet.push(it));
            },
          },
        });

        const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
        if (exchangeError) {
          console.error("exchangeCodeForSession error:", exchangeError);
          return NextResponse.redirect(`${origin}/auth/auth-code-error`);
        }

        const { data: userData } = await supabase.auth.getUser();
        const user = userData?.user;
        if (!user) {
          return NextResponse.redirect(`${origin}/auth/auth-code-error`);
        }

        // Persist the provided Supabase creds for this user (encrypted)
        try {
          const encrypted = encryptCredentials(tempUrl, tempAnonKey);
          const creds = readCredentialsFile();
          creds[user.id] = encrypted;
          writeCredentialsFile(creds);
        } catch (err) {
          console.error("Failed to persist temp supabase creds:", err);
        }

        // Create redirect response and attach any cookies set by the Supabase client
        const res = NextResponse.redirect(`${origin}${next}`);

        // Apply cookies set by supabase client (session cookie)
        try {
          cookiesToSet.forEach((c) => {
            const opts: any = {
              path: c.options?.path || "/",
            };
            if (c.options?.maxAge) opts.maxAge = c.options.maxAge;
            if (c.options?.httpOnly) opts.httpOnly = c.options.httpOnly;
            if (c.options?.sameSite) opts.sameSite = c.options.sameSite;
            if (c.options?.secure) opts.secure = c.options.secure;
            if (c.options?.domain) opts.domain = c.options.domain;
            res.cookies.set(c.name, c.value, opts);
          });
        } catch (err) {
          console.error("Failed to set cookies on response:", err);
        }

        // Remove temporary cookie
        res.cookies.set("temp_supabase_creds", "", { path: "/", maxAge: 0 });

        return res;
      }

      // Fallback: use app-level Supabase client (existing behavior)
      const { cookies: nextCookies } = require("next/headers");
      const cookieStore = await nextCookies();
      const supabase = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL || "", process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "", {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet: any[]) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              );
            } catch {}
          },
        },
      });

      const { error } = await supabase.auth.exchangeCodeForSession(code);
      if (!error) {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (user) {
          // Check if profile exists
          const { data: profile } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", user.id)
            .single();

          if (!profile) {
            // Create profile for OAuth users
            await supabase.from("profiles").insert({
              id: user.id,
              name: user.user_metadata?.name || user.email?.split("@")[0] || "User",
              email: user.email,
              two_factor_enabled: false,
              two_factor_secret: null,
            });
          }

          // Check if 2FA is enabled
          if (profile?.two_factor_enabled) {
            return NextResponse.redirect(`${origin}/auth/verify-2fa`);
          }

          // Redirect to 2FA setup if not enabled
          if (!profile?.two_factor_enabled) {
            return NextResponse.redirect(`${origin}/auth/setup-2fa`);
          }
        }

        return NextResponse.redirect(`${origin}${next}`);
      }
    }

    // Return the user to an error page with instructions
    return NextResponse.redirect(`${origin}/auth/auth-code-error`);
  } catch (err) {
    console.error("OAuth callback error:", err);
    return NextResponse.redirect(`${origin}/auth/auth-code-error`);
  }
}

