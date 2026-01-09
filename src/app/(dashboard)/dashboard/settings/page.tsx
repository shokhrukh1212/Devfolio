import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { SettingsContent } from "./settings-content";
import { getProfile } from "@/lib/data";

export default async function SettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Get profile (cached - deduplicates with layout fetch)
  const profile = await getProfile(user.id);

  return <SettingsContent profile={profile} />;
}
