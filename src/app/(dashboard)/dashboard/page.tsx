import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { DashboardContent } from "./dashboard-content";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Get profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  // Get projects
  const { data: projects } = await supabase
    .from("projects")
    .select("*")
    .eq("profile_id", user.id)
    .order("display_order", { ascending: true });

  // Get analytics (last 7 days)
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const { data: analytics } = await supabase
    .from("analytics_events")
    .select("*")
    .eq("profile_id", user.id)
    .gte("created_at", sevenDaysAgo.toISOString());

  return (
    <DashboardContent
      profile={profile}
      projects={projects || []}
      analytics={analytics || []}
      githubUsername={profile?.username || ""}
      userId={user.id}
    />
  );
}
