import { type NextRequest, NextResponse } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";
import { getToken } from "next-auth/jwt";

function readCredentialsFile() {
  try {
    const fs = require("fs");
    const file = "data/user-supabase-credentials.json";
    if (fs.existsSync(file)) {
      return JSON.parse(fs.readFileSync(file, "utf-8"));
    }
  } catch (e) {
    // ignore
  }
  return {};
}

export async function middleware(request: NextRequest) {
  // Skip middleware entirely for NextAuth's own API routes
  if (request.nextUrl.pathname.startsWith("/api/auth/")) {
    return NextResponse.next();
  }

  // Try NextAuth token first (app-level authentication independent of Supabase)
  try {
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
    if (token) {
      const email = (token as any).email;
      const sub = (token as any).sub;
      const userKey = email ? `nextauth:${email}` : sub ? `nextauth:${sub}` : null;

      // Allow static and auth-related paths
      if (
        request.nextUrl.pathname.startsWith("/api/temp-supabase-creds") ||
        request.nextUrl.pathname.startsWith("/login") ||
        request.nextUrl.pathname.startsWith("/register") ||
        request.nextUrl.pathname.startsWith("/forgot-password") ||
        request.nextUrl.pathname.startsWith("/_next/") ||
        request.nextUrl.pathname === "/favicon.ico"
      ) {
        return NextResponse.next();
      }

      // If no credentials yet, only allow settings/database
      const creds = readCredentialsFile();
      const has = userKey && creds[userKey];
      if (!has && !request.nextUrl.pathname.startsWith("/settings/database")) {
        const url = request.nextUrl.clone();
        url.pathname = "/settings/database";
        return NextResponse.redirect(url);
      }

      return NextResponse.next();
    }
  } catch (e) {
    // ignore token errors and fall back to Supabase middleware
  }

  // Fallback to existing Supabase session flow
  return await updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};


