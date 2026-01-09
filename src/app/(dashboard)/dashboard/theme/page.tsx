import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { ThemeContent } from "./theme-content";
import { getProfile } from "@/lib/data";

export default async function ThemePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Get profile (cached - deduplicates with layout fetch)
  const profile = await getProfile(user.id);

  return <ThemeContent profile={profile} />;
}
