import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  saveUserDatabaseConnection,
  hasUserDatabaseConnection,
} from "@/lib/database/user-connection";

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return NextResponse.json({ connected: false }, { status: 401 });

    const connected = await hasUserDatabaseConnection(user.id);
    return NextResponse.json({ connected });
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

    if (!user)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const { connectionString } = body || {};

    if (!connectionString) {
      return NextResponse.json(
        { error: "Connection string is required" },
        { status: 400 }
      );
    }

    // Ensure encryption key is set in env
    if (!process.env.SUPABASE_KEYS_ENCRYPTION_KEY) {
      return NextResponse.json(
        {
          error: "Server not configured: SUPABASE_KEYS_ENCRYPTION_KEY missing",
        },
        { status: 500 }
      );
    }

    await saveUserDatabaseConnection(user.id, connectionString);
    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Error saving database connection:", err);
    return NextResponse.json(
      { error: err.message || "Failed to save connection" },
      { status: 400 }
    );
  }
}
