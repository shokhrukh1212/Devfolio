import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { DashboardSidebar } from "@/components/dashboard/sidebar";
import { FloatingFeedbackButton } from "@/components/floating-feedback-button";
import { getProfile } from "@/lib/data";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Get user profile (cached - deduplicates with page fetches)
  const profile = await getProfile(user.id);

  return (
    <div className="min-h-screen bg-background">
      <DashboardSidebar user={user} profile={profile} />
      <main className="lg:pl-72">
        <div className="p-6 pb-22 lg:p-8 lg:pb-24">{children}</div>
      </main>

      {/* Floating Feedback Button */}
      <FloatingFeedbackButton userId={user.id} userEmail={profile?.email} />
    </div>
  );
}
