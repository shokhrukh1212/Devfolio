import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { ThemeContent } from "./theme-content";

export default async function ThemePage() {
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

  return <ThemeContent profile={profile} />;
}
