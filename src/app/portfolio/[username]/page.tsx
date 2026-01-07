import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import { MinimalTheme } from "@/components/portfolio/themes/minimal-theme";
import { BentoTheme } from "@/components/portfolio/themes/bento-theme";
import { TerminalTheme } from "@/components/portfolio/themes/terminal-theme";

interface PortfolioPageProps {
  params: Promise<{ username: string }>;
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

export default async function PortfolioPage({ params }: PortfolioPageProps) {
  const { username } = await params;
  const supabase = await createClient();

  // Fetch profile
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("*")
    .eq("username", username)
    .eq("is_published", true)
    .single();

  if (profileError || !profile) {
    notFound();
  }

  // Fetch projects
  const { data: projects } = await supabase
    .from("projects")
    .select("*")
    .eq("profile_id", profile.id)
    .eq("is_visible", true)
    .order("display_order", { ascending: true });

  // Track page view (fire and forget)
  supabase
    .from("analytics_events")
    .insert({
      profile_id: profile.id,
      event_type: "page_view",
    })
    .then(() => {});

  // Render the appropriate theme
  const themeProps = { profile, projects: projects || [] };

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
