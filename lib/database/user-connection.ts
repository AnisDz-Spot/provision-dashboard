import { Pool, PoolClient } from "pg";
import { promises as fs } from "fs";
import path from "path";
import crypto from "crypto";

const STORAGE_PATH = path.join(
  process.cwd(),
  "data",
  "user-database-connections.json"
);

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

/**
 * Save user's database connection string encrypted
 */
export async function saveUserDatabaseConnection(
  userId: string,
  connectionString: string,
  encryptionKey?: string
) {
  // Validate connection string format
  if (!connectionString.startsWith("postgresql://")) {
    throw new Error("Invalid connection string format");
  }

  // Test connection
  try {
    const testPool = new Pool({ connectionString });
    const client = await testPool.connect();
    await client.query("SELECT NOW()");
    client.release();
    await testPool.end();
  } catch (err: any) {
    throw new Error(`Failed to connect: ${err.message}`);
  }

  const key = getKeyFromEnv(encryptionKey);
  if (!key)
    throw new Error(
      "Encryption key not configured (SUPABASE_KEYS_ENCRYPTION_KEY)."
    );

  const payload = JSON.stringify({ connectionString });
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);
  const encrypted = Buffer.concat([
    cipher.update(payload, "utf8"),
    cipher.final(),
  ]);
  const authTag = cipher.getAuthTag();

  const store = await readStorage();
  store[userId] = {
    iv: iv.toString("hex") + ":" + authTag.toString("hex"),
    data: encrypted.toString("hex"),
    createdAt: new Date().toISOString(),
  };
  await writeStorage(store);
}

/**
 * Get user's database connection string (decrypted)
 */
export async function getUserDatabaseConnection(
  userId: string,
  encryptionKey?: string
) {
  const key = getKeyFromEnv(encryptionKey);
  if (!key)
    throw new Error(
      "Encryption key not configured (SUPABASE_KEYS_ENCRYPTION_KEY)."
    );

  const store = await readStorage();
  const record = store[userId];
  if (!record) return null;

  const [ivHex, authTagHex] = record.iv.split(":");
  const iv = Buffer.from(ivHex, "hex");
  const authTag = Buffer.from(authTagHex, "hex");
  const encrypted = Buffer.from(record.data, "hex");

  const decipher = crypto.createDecipheriv("aes-256-gcm", key, iv);
  decipher.setAuthTag(authTag);
  const decrypted = Buffer.concat([
    decipher.update(encrypted),
    decipher.final(),
  ]);
  const parsed = JSON.parse(decrypted.toString("utf8"));
  return parsed.connectionString as string;
}

/**
 * Check if user has database connection configured
 */
export async function hasUserDatabaseConnection(userId: string) {
  const store = await readStorage();
  return Boolean(store[userId]);
}

/**
 * Get PostgreSQL pool for user's database
 * Returns null if user hasn't configured database
 */
export async function getUserDatabasePool(userId: string): Promise<Pool | null> {
  try {
    const connectionString = await getUserDatabaseConnection(userId);
    if (!connectionString) return null;

    const pool = new Pool({
      connectionString,
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000,
    });

    return pool;
  } catch (err) {
    console.error("Failed to create database pool:", err);
    return null;
  }
}

/**
 * Execute a query on user's database
 * Handles pool creation and cleanup
 */
export async function queryUserDatabase(
  userId: string,
  sql: string,
  params?: any[]
) {
  const pool = await getUserDatabasePool(userId);

  if (!pool) {
    throw new Error("Database not configured for user");
  }

  try {
    const result = await pool.query(sql, params);
    return result;
  } finally {
    await pool.end();
  }
}

/**
 * Get a client connection from user's pool
 * Caller is responsible for releasing the client
 */
export async function getUserDatabaseClient(userId: string): Promise<PoolClient | null> {
  const pool = await getUserDatabasePool(userId);
  if (!pool) return null;

  try {
    return await pool.connect();
  } catch (err) {
    console.error("Failed to get database client:", err);
    return null;
  }
}
