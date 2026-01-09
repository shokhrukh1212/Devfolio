import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  const hostname = request.headers.get("host") || "";
  const url = request.nextUrl.clone();

  // Extract subdomain
  // hostname: "aziz.repospace.uz" -> subdomain: "aziz"
  // hostname: "repospace.uz" -> subdomain: null
  // hostname: "localhost:3000" -> subdomain: null

  const baseDomain = process.env.NEXT_PUBLIC_BASE_DOMAIN || "repospace.uz";
  const isLocalhost = hostname.includes("localhost");
  const isBaseDomain =
    hostname === baseDomain || hostname === `www.${baseDomain}`;

  let subdomain: string | null = null;

  if (!isLocalhost && hostname.endsWith(baseDomain)) {
    const parts = hostname.replace(`.${baseDomain}`, "").split(".");
    if (parts.length === 1 && parts[0] !== "www" && parts[0] !== baseDomain) {
      subdomain = parts[0];
    }
  }

  // For local development, check for username.localhost pattern
  if (isLocalhost) {
    const parts = hostname.split(".");
    if (parts.length > 1 && parts[0] !== "www") {
      // username.localhost:3000
      subdomain = parts[0];
    }
  }

  // If subdomain exists, rewrite to portfolio page
  if (subdomain) {
    url.pathname = `/portfolio/${subdomain}${
      url.pathname === "/" ? "" : url.pathname
    }`;
    return NextResponse.rewrite(url);
  }

  // Custom domain routing (future feature)
  // If NOT base domain AND NOT subdomain AND NOT localhost, check for custom domain
  if (
    !isLocalhost &&
    !isBaseDomain &&
    !subdomain &&
    !hostname.includes(baseDomain)
  ) {
    // Create a Supabase client for the lookup
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll() {
            // No-op for lookup only
          },
        },
      }
    );

    // Look up the custom domain in the database
    const { data: profile } = await supabase
      .from("profiles")
      .select("username")
      .eq("custom_domain", hostname)
      .eq("custom_domain_verified", true)
      .single();

    if (profile?.username) {
      url.pathname = `/portfolio/${profile.username}${
        url.pathname === "/" ? "" : url.pathname
      }`;
      return NextResponse.rewrite(url);
    }
  }

  // Update session for all requests
  const { supabaseResponse, user } = await updateSession(request);

  // Handle auth for dashboard routes
  if (url.pathname.startsWith("/dashboard")) {
    if (!user) {
      url.pathname = "/login";
      return NextResponse.redirect(url);
    }
  }

  // Redirect logged-in users away from login page
  if (url.pathname === "/login" && user) {
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
