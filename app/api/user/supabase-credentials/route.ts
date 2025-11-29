import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

const ENCRYPTION_KEY = process.env.SUPABASE_KEYS_ENCRYPTION_KEY || "";

if (!ENCRYPTION_KEY || ENCRYPTION_KEY.length !== 64) {
  throw new Error(
    "SUPABASE_KEYS_ENCRYPTION_KEY must be a 32-byte hex string (64 chars)"
  );
}

function encryptCredentials(url: string, anonKey: string): string {
  const iv = crypto.randomBytes(12);
  const encKey = Buffer.from(ENCRYPTION_KEY, "hex");
  const cipher = crypto.createCipheriv("aes-256-gcm", encKey, iv);

  const data = JSON.stringify({ url, anonKey });
  let encrypted = cipher.update(data, "utf-8", "hex");
  encrypted += cipher.final("hex");

  const authTag = cipher.getAuthTag();
  return `${iv.toString("hex")}:${authTag.toString("hex")}:${encrypted}`;
}

function decryptCredentials(encrypted: string): { url: string; anonKey: string } {
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
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const credentials = readCredentials();
    const encrypted = credentials[user.id];

    if (!encrypted) {
      return NextResponse.json({
        configured: false,
      });
    }

    try {
      const decrypted = decryptCredentials(encrypted);
      return NextResponse.json({
        configured: true,
        url: decrypted.url,
        anonKey: decrypted.anonKey,
      });
    } catch (err) {
      return NextResponse.json({
        configured: false,
        error: "Failed to decrypt credentials",
      });
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
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { url, anonKey } = await request.json();

    if (!url || !anonKey) {
      return NextResponse.json(
        { error: "Missing Supabase URL or anon key" },
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

    if (anonKey.length < 20) {
      return NextResponse.json(
        { error: "Invalid anon key format" },
        { status: 400 }
      );
    }

    // Encrypt and store
    const encrypted = encryptCredentials(url, anonKey);
    const credentials = readCredentials();
    credentials[user.id] = encrypted;
    writeCredentials(credentials);

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Internal server error" },
      { status: 500 }
    );
  }
}
