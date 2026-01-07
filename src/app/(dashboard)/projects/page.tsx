import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { ProjectsContent } from "./projects-content";

export default async function ProjectsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Get projects
  const { data: projects } = await supabase
    .from("projects")
    .select("*")
    .eq("profile_id", user.id)
    .order("display_order", { ascending: true });

  return <ProjectsContent initialProjects={projects || []} userId={user.id} />;
}
