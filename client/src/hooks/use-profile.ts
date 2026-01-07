import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl, type ProfileInput } from "@shared/routes";
import { useToast } from "@/hooks/use-toast";

// Fetch the currently logged-in user's profile
export function useProfile() {
  return useQuery({
    queryKey: [api.profile.get.path],
    queryFn: async () => {
      const res = await fetch(api.profile.get.path, { credentials: "include" });
      if (res.status === 404) return null; // Handle case where profile doesn't exist yet
      if (res.status === 401) throw new Error("Unauthorized");
      if (!res.ok) throw new Error("Failed to fetch profile");
      return api.profile.get.responses[200].parse(await res.json());
    },
    retry: false,
  });
}

// Fetch a public portfolio by username
export function usePublicProfile(username: string) {
  return useQuery({
    queryKey: [api.profile.getByUsername.path, username],
    queryFn: async () => {
      const url = buildUrl(api.profile.getByUsername.path, { username });
      const res = await fetch(url);
      if (res.status === 404) throw new Error("Portfolio not found");
      if (!res.ok) throw new Error("Failed to fetch portfolio");
      return api.profile.getByUsername.responses[200].parse(await res.json());
    },
    enabled: !!username,
  });
}

// Update profile mutation
export function useUpdateProfile() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: ProfileInput) => {
      const res = await fetch(api.profile.update.path, {
        method: api.profile.update.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });

      if (!res.ok) {
        if (res.status === 400) {
          const error = await res.json();
          throw new Error(error.message || "Validation failed");
        }
        throw new Error("Failed to update profile");
      }
      return api.profile.update.responses[200].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.profile.get.path] });
      toast({
        title: "Profile updated",
        description: "Your changes have been saved successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}
