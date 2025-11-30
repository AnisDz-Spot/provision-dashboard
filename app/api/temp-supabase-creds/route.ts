import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { url, anonKey } = await request.json();

    if (!url || !anonKey) {
      return NextResponse.json({ error: "Missing url or anonKey" }, { status: 400 });
    }

    if (!url.includes("supabase.co")) {
      return NextResponse.json({ error: "Invalid Supabase URL" }, { status: 400 });
    }

    const value = encodeURIComponent(JSON.stringify({ url, anonKey }));

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
