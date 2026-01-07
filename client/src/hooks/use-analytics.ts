import { useMutation } from "@tanstack/react-query";
import { api, type AnalyticsInput } from "@shared/routes";

export function useTrackEvent() {
  return useMutation({
    mutationFn: async (data: AnalyticsInput) => {
      // Analytics should fail silently so it doesn't break user experience
      try {
        await fetch(api.analytics.track.path, {
          method: api.analytics.track.method,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
      } catch (err) {
        console.error("Failed to track analytics event", err);
      }
    },
  });
}
