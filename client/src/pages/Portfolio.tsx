import { useEffect } from "react";
import { useRoute } from "wouter";
import { usePublicProfile } from "@/hooks/use-profile";
import { useTrackEvent } from "@/hooks/use-analytics";
import { MinimalTheme } from "@/components/themes/MinimalTheme";
import { BentoTheme } from "@/components/themes/BentoTheme";
import { TerminalTheme } from "@/components/themes/TerminalTheme";
import { Loader2, AlertCircle } from "lucide-react";

export default function Portfolio() {
  const [match, params] = useRoute("/portfolio/:username");
  const username = params?.username || "";
  
  const { data: profile, isLoading, error } = usePublicProfile(username);
  const { mutate: track } = useTrackEvent();

  // Track page view
  useEffect(() => {
    if (profile) {
      track({
        profileId: profile.id,
        eventType: "page_view",
        referrer: document.referrer,
        userAgent: navigator.userAgent
      });
    }
  }, [profile, track]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50">
        <Loader2 className="w-8 h-8 animate-spin text-zinc-400" />
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-zinc-50 p-4 text-center">
        <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
        <h1 className="text-2xl font-bold text-zinc-900 mb-2">Profile not found</h1>
        <p className="text-zinc-600">The portfolio you're looking for doesn't exist or is private.</p>
      </div>
    );
  }

  // Render correct theme
  switch (profile.theme) {
    case "bento":
      return <BentoTheme data={profile} />;
    case "terminal":
      return <TerminalTheme data={profile} />;
    case "minimal":
    default:
      return <MinimalTheme data={profile} />;
  }
}
