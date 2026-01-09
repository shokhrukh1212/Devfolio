"use client";

import { useCallback, useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import type { AnalyticsEventType, AnalyticsMetadata } from "@/types";

// Generate or retrieve session ID from localStorage
function getSessionId(): string {
  if (typeof window === "undefined") return "";

  const storageKey = "devfolio_session_id";
  let sessionId = localStorage.getItem(storageKey);

  if (!sessionId) {
    sessionId = crypto.randomUUID();
    localStorage.setItem(storageKey, sessionId);
  }

  return sessionId;
}

// Detect referrer type from URL
function detectReferrerType(referrer: string): AnalyticsMetadata["referrer_type"] {
  if (!referrer) return "direct";

  const lowerReferrer = referrer.toLowerCase();

  if (lowerReferrer.includes("linkedin")) return "linkedin";
  if (lowerReferrer.includes("greenhouse")) return "greenhouse";
  if (lowerReferrer.includes("lever.co")) return "lever";
  if (lowerReferrer.includes("workday")) return "workday";
  if (lowerReferrer.includes("t.me") || lowerReferrer.includes("telegram")) return "telegram";

  return "other";
}

interface UseAnalyticsProps {
  profileId: string;
  isOwner?: boolean;
  isPreview?: boolean;
  visitorCountry?: string | null;
  visitorCity?: string | null;
  serverReferrer?: string | null;
}

interface TrackEventParams {
  eventType: AnalyticsEventType;
  projectId?: string;
  metadata?: AnalyticsMetadata;
}

export function useAnalytics({
  profileId,
  isOwner = false,
  isPreview = false,
  visitorCountry,
  visitorCity,
  serverReferrer,
}: UseAnalyticsProps) {
  const supabase = createClient();
  const sessionIdRef = useRef<string>("");
  const pageViewTrackedRef = useRef(false);

  // Initialize session ID on mount
  useEffect(() => {
    sessionIdRef.current = getSessionId();
  }, []);

  // Track an event
  const trackEvent = useCallback(async ({
    eventType,
    projectId,
    metadata = {},
  }: TrackEventParams) => {
    // Privacy guard: Don't track if owner is viewing or preview mode
    if (isOwner || isPreview) {
      return;
    }

    // Use server referrer if available, otherwise fall back to document.referrer
    const referrer = serverReferrer || (typeof document !== "undefined" ? document.referrer : "");
    const userAgent = typeof navigator !== "undefined" ? navigator.userAgent : "";

    // Enrich metadata with referrer type
    const enrichedMetadata: AnalyticsMetadata = {
      ...metadata,
      referrer_type: detectReferrerType(referrer),
    };

    try {
      await supabase.from("analytics_events").insert({
        profile_id: profileId,
        visitor_session_id: sessionIdRef.current || null,
        event_type: eventType,
        project_id: projectId || null,
        metadata: enrichedMetadata,
        referrer: referrer || null,
        visitor_country: visitorCountry || null,
        visitor_city: visitorCity || null,
        user_agent: userAgent || null,
      });
    } catch (error) {
      // Silently fail - don't break the app for analytics
      console.error("Analytics tracking failed:", error);
    }
  }, [supabase, profileId, isOwner, isPreview, visitorCountry, visitorCity, serverReferrer]);

  // Track page view (only once per session)
  const trackPageView = useCallback(() => {
    if (pageViewTrackedRef.current) return;
    pageViewTrackedRef.current = true;

    trackEvent({
      eventType: "page_view",
      metadata: {
        referrer_type: detectReferrerType(
          typeof document !== "undefined" ? document.referrer : ""
        ),
      },
    });
  }, [trackEvent]);

  // Track resume download
  const trackResumeDownload = useCallback((buttonLocation?: string) => {
    trackEvent({
      eventType: "resume_download",
      metadata: { button_location: buttonLocation },
    });
  }, [trackEvent]);

  // Track project interaction with duration
  const projectInteractionStart = useRef<{ projectId: string; startTime: number } | null>(null);

  const startProjectInteraction = useCallback((projectId: string, projectTitle?: string) => {
    projectInteractionStart.current = {
      projectId,
      startTime: Date.now(),
    };

    // Also track the click event
    trackEvent({
      eventType: "project_click",
      projectId,
      metadata: { project_title: projectTitle },
    });
  }, [trackEvent]);

  const endProjectInteraction = useCallback((projectTitle?: string) => {
    if (!projectInteractionStart.current) return;

    const { projectId, startTime } = projectInteractionStart.current;
    const durationSeconds = Math.round((Date.now() - startTime) / 1000);

    // Only track if they spent at least 1 second
    if (durationSeconds >= 1) {
      trackEvent({
        eventType: "project_interaction",
        projectId,
        metadata: {
          duration_seconds: durationSeconds,
          project_title: projectTitle,
        },
      });
    }

    projectInteractionStart.current = null;
  }, [trackEvent]);

  // Track link clicks
  const trackGitHubClick = useCallback((projectId?: string, projectTitle?: string) => {
    trackEvent({
      eventType: "github_click",
      projectId,
      metadata: { project_title: projectTitle },
    });
  }, [trackEvent]);

  const trackDemoClick = useCallback((projectId?: string, projectTitle?: string) => {
    trackEvent({
      eventType: "demo_click",
      projectId,
      metadata: { project_title: projectTitle },
    });
  }, [trackEvent]);

  const trackSocialClick = useCallback((platform: string) => {
    trackEvent({
      eventType: "social_click",
      metadata: { button_location: platform },
    });
  }, [trackEvent]);

  return {
    trackEvent,
    trackPageView,
    trackResumeDownload,
    startProjectInteraction,
    endProjectInteraction,
    trackGitHubClick,
    trackDemoClick,
    trackSocialClick,
  };
}
