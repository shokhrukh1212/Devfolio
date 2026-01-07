import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard";

  if (code) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && data.user) {
      // Check if profile exists
      const { data: profile } = await supabase
        .from("profiles")
        .select("id")
        .eq("id", data.user.id)
        .single();

      // Create profile if it doesn't exist
      if (!profile) {
        const githubUsername =
          data.user.user_metadata?.user_name ||
          data.user.user_metadata?.preferred_username ||
          data.user.email?.split("@")[0] ||
          `user_${data.user.id.slice(0, 8)}`;

        await supabase.from("profiles").insert({
          id: data.user.id,
          username: githubUsername,
          display_name: data.user.user_metadata?.full_name || githubUsername,
          avatar_url: data.user.user_metadata?.avatar_url,
          email: data.user.email,
          github_url: `https://github.com/${githubUsername}`,
        });
      }

      const forwardedHost = request.headers.get("x-forwarded-host");
      const isLocalEnv = process.env.NODE_ENV === "development";

      if (isLocalEnv) {
        return NextResponse.redirect(`${origin}${next}`);
      } else if (forwardedHost) {
        return NextResponse.redirect(`https://${forwardedHost}${next}`);
      } else {
        return NextResponse.redirect(`${origin}${next}`);
      }
    }
  }

  // Return to login with error
  return NextResponse.redirect(`${origin}/login?error=auth_failed`);
}
