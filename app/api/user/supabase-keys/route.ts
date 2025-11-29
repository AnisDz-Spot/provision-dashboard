import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { saveUserKeys, getUserKeys, hasUserKeys } from "@/lib/supabase/secure-store";

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return NextResponse.json({ connected: false }, { status: 401 });

    const has = await hasUserKeys(user.id);
    return NextResponse.json({ connected: has });
  } catch (err: any) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const { url, anonKey } = body || {};
    if (!url || !anonKey) {
      return NextResponse.json({ error: "Missing url or anonKey" }, { status: 400 });
    }

    // Ensure encryption key is set in env
    if (!process.env.SUPABASE_KEYS_ENCRYPTION_KEY) {
      return NextResponse.json({ error: "Server not configured: SUPABASE_KEYS_ENCRYPTION_KEY missing" }, { status: 500 });
    }

    await saveUserKeys(user.id, url, anonKey);
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
