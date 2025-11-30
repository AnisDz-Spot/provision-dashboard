import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { getToken } from "next-auth/jwt";

const ENCRYPTION_KEY = process.env.SUPABASE_KEYS_ENCRYPTION_KEY || "";

function encryptCredentials(url: string, apiKey: string): string {
  if (!ENCRYPTION_KEY || ENCRYPTION_KEY.length !== 64) {
    throw new Error(
      "SUPABASE_KEYS_ENCRYPTION_KEY must be set to a 32-byte hex string (64 chars)"
    );
  }

  const iv = crypto.randomBytes(12);
  const encKey = Buffer.from(ENCRYPTION_KEY, "hex");
  const cipher = crypto.createCipheriv("aes-256-gcm", encKey, iv);

  const data = JSON.stringify({ url, apiKey });
  let encrypted = cipher.update(data, "utf-8", "hex");
  encrypted += cipher.final("hex");

  const authTag = cipher.getAuthTag();
  return `${iv.toString("hex")}:${authTag.toString("hex")}:${encrypted}`;
}

function decryptCredentials(encrypted: string): { url: string; apiKey: string } {
  if (!ENCRYPTION_KEY || ENCRYPTION_KEY.length !== 64) {
    throw new Error(
      "SUPABASE_KEYS_ENCRYPTION_KEY must be set to a 32-byte hex string (64 chars)"
    );
  }

  const [ivHex, authTagHex, ciphertext] = encrypted.split(":");
  const encKey = Buffer.from(ENCRYPTION_KEY, "hex");

  const decipher = crypto.createDecipheriv(
    "aes-256-gcm",
    encKey,
    Buffer.from(ivHex, "hex")
  );

  decipher.setAuthTag(Buffer.from(authTagHex, "hex"));

  let decrypted = decipher.update(ciphertext, "hex", "utf-8");
  decrypted += decipher.final("utf-8");

  return JSON.parse(decrypted);
}

// Store credentials in a simple JSON file for development
// In production, this should be stored in a database
const credentialsFile = "data/user-supabase-credentials.json";

function readCredentials(): Record<string, string> {
  try {
    const fs = require("fs");
    if (fs.existsSync(credentialsFile)) {
      const data = fs.readFileSync(credentialsFile, "utf-8");
      return JSON.parse(data);
    }
  } catch (err) {
    console.error("Error reading credentials file:", err);
  }
  return {};
}

function writeCredentials(data: Record<string, string>) {
  try {
    const fs = require("fs");
    const dir = require("path").dirname(credentialsFile);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(credentialsFile, JSON.stringify(data, null, 2));
  } catch (err) {
    console.error("Error writing credentials file:", err);
    throw new Error("Failed to save credentials");
  }
}

export async function GET(request: NextRequest) {
  try {
    // Try Supabase session first (if app-level supabase configured)
    let userId: string | null = null;
    try {
      const supabase = await createClient();
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (!authError && user) {
        userId = user.id;
      }
    } catch (e) {
      // createClient may throw when app-level SUPABASE env is missing; ignore
      userId = null;
    }

    // If no supabase user, try NextAuth token
    if (!userId) {
      const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
      if (token) {
        const email = (token as any).email;
        const sub = (token as any).sub;
        userId = email ? `nextauth:${email}` : sub ? `nextauth:${sub}` : null;
      }
    }

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const credentials = readCredentials();
    const encrypted = credentials[userId];

    if (!encrypted) {
      return NextResponse.json({ configured: false });
    }

    try {
      const decrypted = decryptCredentials(encrypted);
      return NextResponse.json({ configured: true, url: decrypted.url, apiKey: decrypted.apiKey });
    } catch (err) {
      return NextResponse.json({ configured: false, error: "Failed to decrypt credentials" });
    }
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Determine current user id (support Supabase sessions or NextAuth tokens)
    let userId: string | null = null;
    try {
      const supabase = await createClient();
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (!authError && user) {
        userId = user.id;
      }
    } catch (e) {
      userId = null;
    }

    if (!userId) {
      const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
      if (token) {
        const email = (token as any).email;
        const sub = (token as any).sub;
        userId = email ? `nextauth:${email}` : sub ? `nextauth:${sub}` : null;
      }
    }

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { url, apiKey, anonKey } = await request.json();
    const key = apiKey || anonKey;

    if (!url || !key) {
      return NextResponse.json(
        { error: "Missing Supabase URL or API key" },
        { status: 400 }
      );
    }

    // Validate format
    if (!url.includes("supabase.co")) {
      return NextResponse.json(
        { error: "Invalid Supabase URL format" },
        { status: 400 }
      );
    }

    if (key.length < 20) {
      return NextResponse.json(
        { error: "Invalid API key format" },
        { status: 400 }
      );
    }

    // Encrypt and store
    const encrypted = encryptCredentials(url, key);
    const credentials = readCredentials();
    credentials[userId] = encrypted;
    writeCredentials(credentials);

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Internal server error" },
      { status: 500 }
    );
  }
}
