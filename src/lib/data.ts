import { cache } from "react";
import { createClient } from "@/lib/supabase/server";

// Cached profile fetch - deduplicates within a single request
export const getProfile = cache(async (userId: string) => {
  const supabase = await createClient();
  const { data } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();
  return data;
});

// Cached projects fetch
export const getProjects = cache(async (userId: string) => {
  const supabase = await createClient();
  const { data } = await supabase
    .from("projects")
    .select("*")
    .eq("profile_id", userId)
    .order("display_order", { ascending: true });
  return data || [];
});

// Cached analytics fetch (last 7 days)
export const getAnalytics = cache(async (userId: string) => {
  const supabase = await createClient();
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const { data } = await supabase
    .from("analytics_events")
    .select("*")
    .eq("profile_id", userId)
    .gte("created_at", sevenDaysAgo.toISOString());
  return data || [];
});
