import { createClient } from "@/lib/supabase/server";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import { MinimalTheme } from "@/components/portfolio/themes/minimal-theme";
import { BentoTheme } from "@/components/portfolio/themes/bento-theme";
import { TerminalTheme } from "@/components/portfolio/themes/terminal-theme";

interface PortfolioPageProps {
  params: Promise<{ username: string }>;
  searchParams: Promise<{ preview?: string }>;
}

export async function generateMetadata({
  params,
  searchParams,
}: PortfolioPageProps): Promise<Metadata> {
  const { username } = await params;
  const { preview } = await searchParams;
  const supabase = await createClient();

  const isPreviewMode = preview === "true";

  // Build query - allow unpublished profiles in preview mode
  let query = supabase
    .from("profiles")
    .select("display_name, bio, avatar_url")
    .eq("username", username);

  if (!isPreviewMode) {
    query = query.eq("is_published", true);
  }

  const { data: profile } = await query.single();

  if (!profile) {
    return {
      title: "Portfolio Not Found",
    };
  }

  return {
    title: `${profile.display_name || username} | RepoSpace`,
    description: profile.bio || `${profile.display_name}'s developer portfolio`,
    openGraph: {
      title: `${profile.display_name || username} | RepoSpace`,
      description:
        profile.bio || `${profile.display_name}'s developer portfolio`,
      images: profile.avatar_url ? [profile.avatar_url] : [],
    },
  };
}

export default async function PortfolioPage({
  params,
  searchParams,
}: PortfolioPageProps) {
  const { username } = await params;
  const { preview } = await searchParams;

  const headersList = await headers();
  const visitorCountry = headersList.get("x-vercel-ip-country") || null;
  const visitorCity = headersList.get("x-vercel-ip-city") || null;
  const serverReferrer = headersList.get("referer") || null;

  const supabase = await createClient();

  const isPreviewMode = preview === "true";

  // Get current user session first (needed for owner preview check)
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Fetch profile - if preview mode, allow unpublished portfolios for owner
  let profileQuery = supabase
    .from("profiles")
    .select("*")
    .eq("username", username);

  // Only require is_published if NOT in preview mode
  if (!isPreviewMode) {
    profileQuery = profileQuery.eq("is_published", true);
  }

  const { data: profile, error: profileError } = await profileQuery.single();

  if (profileError || !profile) {
    notFound();
  }

  // If preview mode but portfolio is unpublished, only allow the owner to view
  if (isPreviewMode && !profile.is_published && user?.id !== profile.id) {
    notFound();
  }

  // Fetch projects - featured first, then by display_order
  const { data: projects } = await supabase
    .from("projects")
    .select("*")
    .eq("profile_id", profile.id)
    .eq("is_visible", true)
    .order("is_featured", { ascending: false })
    .order("display_order", { ascending: true });

  // Self-View Guard: Don't track if preview mode or owner is viewing
  const isOwnerViewing = user?.id === profile.id;

  // Analytics props to pass to themes (tracking is handled client-side)
  const analyticsProps = {
    isOwner: isOwnerViewing,
    isPreview: isPreviewMode,
    visitorCountry,
    visitorCity,
    serverReferrer,
  };

  // Render the appropriate theme
  const themeProps = {
    profile,
    projects: projects || [],
    ...analyticsProps,
  };

  switch (profile.theme) {
    case "bento":
      return <BentoTheme {...themeProps} />;
    case "terminal":
      return <TerminalTheme {...themeProps} />;
    case "minimal":
    default:
      return <MinimalTheme {...themeProps} />;
  }
}
