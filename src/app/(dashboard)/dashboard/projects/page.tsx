import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { ProjectsContent } from "./projects-content";
import { getProfile, getProjects } from "@/lib/data";

export default async function ProjectsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Fetch profile and projects in parallel using cached functions
  const [profile, projects] = await Promise.all([
    getProfile(user.id),
    getProjects(user.id),
  ]);

  return (
    <ProjectsContent
      initialProjects={projects || []}
      userId={user.id}
      githubUsername={profile?.username || ""}
      planTier={profile?.plan_tier || "free"}
      currentBio={profile?.bio}
      currentLocation={profile?.location}
    />
  );
}
