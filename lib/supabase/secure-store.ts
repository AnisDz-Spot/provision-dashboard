import { promises as fs } from "fs";
import path from "path";
import crypto from "crypto";

const STORAGE_PATH = path.join(process.cwd(), "data", "user-supabase-keys.json");

type StoredRecord = {
  iv: string;
  data: string;
  createdAt: string;
};

async function readStorage(): Promise<Record<string, StoredRecord>> {
  try {
    const raw = await fs.readFile(STORAGE_PATH, "utf8");
    return JSON.parse(raw || "{}");
  } catch (err) {
    return {};
  }
}

async function writeStorage(obj: Record<string, StoredRecord>) {
  await fs.mkdir(path.dirname(STORAGE_PATH), { recursive: true });
  await fs.writeFile(STORAGE_PATH, JSON.stringify(obj, null, 2), "utf8");
}

function getKeyFromEnv(encryptionKey?: string) {
  // Expect a base64 string or raw string; normalize to 32 bytes key
  const key = encryptionKey ?? process.env.SUPABASE_KEYS_ENCRYPTION_KEY;
  if (!key) return null;
  // If base64-length matches 32 bytes when decoded, use it; otherwise hash
  try {
    const buf = Buffer.from(key, "base64");
    if (buf.length === 32) return buf;
  } catch {}
  return crypto.createHash("sha256").update(String(key)).digest();
}

export async function saveUserKeys(
  userId: string,
  url: string,
  anonKey: string,
  encryptionKey?: string
) {
  const key = getKeyFromEnv(encryptionKey);
  if (!key) throw new Error("Encryption key not configured (SUPABASE_KEYS_ENCRYPTION_KEY).");

  const payload = JSON.stringify({ url, anonKey });
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);
  const encrypted = Buffer.concat([cipher.update(payload, "utf8"), cipher.final()]);
  const authTag = cipher.getAuthTag();

  const store = await readStorage();
  store[userId] = {
    iv: iv.toString("hex") + ":" + authTag.toString("hex"),
    data: encrypted.toString("hex"),
    createdAt: new Date().toISOString(),
  };
  await writeStorage(store);
}

export async function getUserKeys(userId: string, encryptionKey?: string) {
  const key = getKeyFromEnv(encryptionKey);
  if (!key) throw new Error("Encryption key not configured (SUPABASE_KEYS_ENCRYPTION_KEY).");

  const store = await readStorage();
  const record = store[userId];
  if (!record) return null;

  const [ivHex, authTagHex] = record.iv.split(":");
  const iv = Buffer.from(ivHex, "hex");
  const authTag = Buffer.from(authTagHex, "hex");
  const encrypted = Buffer.from(record.data, "hex");

  const decipher = crypto.createDecipheriv("aes-256-gcm", key, iv);
  decipher.setAuthTag(authTag);
  const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);
  const parsed = JSON.parse(decrypted.toString("utf8"));
  return parsed as { url: string; anonKey: string };
}

export async function hasUserKeys(userId: string) {
  const store = await readStorage();
  return Boolean(store[userId]);
}
