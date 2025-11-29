import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard";

  if (code) {
    const supabase = await createClient();
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
}

