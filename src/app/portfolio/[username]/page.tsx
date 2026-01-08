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
}: PortfolioPageProps): Promise<Metadata> {
  const { username } = await params;
  const supabase = await createClient();

  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name, bio, avatar_url")
    .eq("username", username)
    .eq("is_published", true)
    .single();

  if (!profile) {
    return {
      title: "Portfolio Not Found",
    };
  }

  return {
    title: `${profile.display_name || username} | Devfolio`,
    description: profile.bio || `${profile.display_name}'s developer portfolio`,
    openGraph: {
      title: `${profile.display_name || username} | Devfolio`,
      description: profile.bio || `${profile.display_name}'s developer portfolio`,
      images: profile.avatar_url ? [profile.avatar_url] : [],
    },
  };
}

export default async function PortfolioPage({ params, searchParams }: PortfolioPageProps) {
  const { username } = await params;
  const { preview } = await searchParams;
  const supabase = await createClient();

  // Get geo-location from Vercel headers
  const headersList = await headers();
  const geoCountry = headersList.get("x-vercel-ip-country") || null;

  const isPreviewMode = preview === "true";

  // Get current user session first (needed for owner preview check)
  const { data: { user } } = await supabase.auth.getUser();

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

  // Fetch projects
  const { data: projects } = await supabase
    .from("projects")
    .select("*")
    .eq("profile_id", profile.id)
    .eq("is_visible", true)
    .order("display_order", { ascending: true });

  // Self-View Guard: Don't track if preview mode or owner is viewing
  const isOwnerViewing = user?.id === profile.id;

  // Analytics props to pass to themes (tracking is handled client-side)
  const analyticsProps = {
    isOwner: isOwnerViewing,
    isPreview: isPreviewMode,
    geoCountry,
  };

  // Render the appropriate theme
  const themeProps = { profile, projects: projects || [], ...analyticsProps };

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
