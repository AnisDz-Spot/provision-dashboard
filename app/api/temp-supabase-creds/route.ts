import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { url, apiKey, anonKey } = await request.json();
    const key = apiKey || anonKey;

    if (!url || !key) {
      return NextResponse.json({ error: "Missing url or apiKey" }, { status: 400 });
    }

    if (!url.includes("supabase.co")) {
      return NextResponse.json({ error: "Invalid Supabase URL" }, { status: 400 });
    }

    // Canonicalize to `apiKey` in the temporary cookie payload
    const value = encodeURIComponent(JSON.stringify({ url, apiKey: key }));

    const res = NextResponse.json({ success: true });
    res.cookies.set("temp_supabase_creds", value, {
      httpOnly: true,
      path: "/",
      maxAge: 300,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    });

    return res;
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Internal error" }, { status: 500 });
  }
}
