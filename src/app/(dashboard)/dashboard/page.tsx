import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { DashboardContent } from "./dashboard-content";
import { getProfile, getProjects, getAnalytics } from "@/lib/data";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Fetch all data in parallel using cached functions
  const [profile, projects, analytics] = await Promise.all([
    getProfile(user.id),
    getProjects(user.id),
    getAnalytics(user.id),
  ]);

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
