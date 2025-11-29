import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { TOTP } from "https://esm.sh/otpauth@9.2.3";

serve(async (req) => {
  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      {
        global: {
          headers: { Authorization: req.headers.get("Authorization")! },
        },
      }
    );

    const {
      data: { user },
    } = await supabaseClient.auth.getUser();

    if (!user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    const { code, secret } = await req.json();

    if (!code || !secret) {
      return new Response(JSON.stringify({ error: "Code and secret required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Verify TOTP code
    const totp = new TOTP({
      secret: secret,
      algorithm: "SHA1",
      digits: 6,
      period: 30,
    });

    const isValid = totp.validate({ token: code, window: 1 }) !== null;

    return new Response(JSON.stringify({ valid: isValid }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});

