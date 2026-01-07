import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  const hostname = request.headers.get("host") || "";
  const url = request.nextUrl.clone();

  // Extract subdomain
  // hostname: "aziz.devfolio.uz" -> subdomain: "aziz"
  // hostname: "devfolio.uz" -> subdomain: null
  // hostname: "localhost:3000" -> subdomain: null

  const baseDomain = process.env.NEXT_PUBLIC_BASE_DOMAIN || "devfolio.uz";
  const isLocalhost = hostname.includes("localhost");

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
    url.pathname = `/portfolio/${subdomain}${url.pathname === "/" ? "" : url.pathname}`;
    return NextResponse.rewrite(url);
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
