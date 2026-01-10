"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Star,
  Check,
  Github,
  Loader2,
  GitFork,
  Archive,
  Info,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import type { Project, PlanTier } from "@/types";
import { PLAN_LIMITS } from "@/types";

// GitHub repo type for sync
interface GitHubRepo {
  id: number;
  name: string;
  description: string | null;
  html_url: string;
  homepage: string | null;
  stargazers_count: number;
  forks_count: number;
  language: string | null;
  topics: string[];
  fork: boolean;
  archived: boolean;
  pushed_at: string;
}

// GitHub user profile
interface GitHubUser {
  bio: string | null;
  location: string | null;
}

interface GitHubSyncModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  githubUsername: string;
  userId: string;
  existingProjects: Project[];
  planTier?: PlanTier;
  currentBio?: string | null;
  currentLocation?: string | null;
  onImportComplete: (newProjects: Project[]) => void;
}

export function GitHubSyncModal({
  open,
  onOpenChange,
  githubUsername,
  userId,
  existingProjects,
  planTier = "free",
  currentBio,
  currentLocation,
  onImportComplete,
}: GitHubSyncModalProps) {
  const t = useTranslations("githubSync");
  const tToast = useTranslations("toast");
  const supabase = useMemo(() => createClient(), []);

  const [fetchedRepos, setFetchedRepos] = useState<GitHubRepo[]>([]);
  const [selectedRepos, setSelectedRepos] = useState<Set<number>>(new Set());
  const [excludeForks, setExcludeForks] = useState(true);
  const [excludeArchived, setExcludeArchived] = useState(true);
  const [sortBy, setSortBy] = useState<"stars" | "newest">("stars");
  const [loading, setLoading] = useState(false);
  const [importing, setImporting] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // Plan limits
  const maxProjects = PLAN_LIMITS[planTier] || 10;
  const usedSlots = existingProjects.length;
  const availableSlots = Math.max(0, maxProjects - usedSlots);
  const totalSelected = usedSlots + selectedRepos.size;

  // Memoize existing repo IDs to prevent infinite re-renders
  const existingRepoIds = useMemo(
    () =>
      new Set(existingProjects.map((p) => p.github_repo_id).filter(Boolean)),
    [existingProjects]
  );

  // Fetch repos when modal opens
  const fetchRepos = useCallback(async () => {
    if (!githubUsername || fetchedRepos.length > 0) return;

    setLoading(true);
    setFetchError(null);
    try {
      // Fetch user profile to get bio and location
      const userResponse = await fetch(
        `https://api.github.com/users/${githubUsername}`
      );
      if (userResponse.ok) {
        const userData: GitHubUser = await userResponse.json();

        // Pre-fill bio and location if they're currently empty
        const updates: { bio?: string; location?: string } = {};
        if (!currentBio && userData.bio) {
          updates.bio = userData.bio;
        }
        if (!currentLocation && userData.location) {
          updates.location = userData.location;
        }

        if (Object.keys(updates).length > 0) {
          await supabase.from("profiles").update(updates).eq("id", userId);
        }
      }

      // Fetch repos from GitHub API
      const response = await fetch(
        `https://api.github.com/users/${githubUsername}/repos?per_page=100&sort=pushed`
      );

      if (!response.ok) {
        if (response.status === 403) {
          throw new Error("rate_limit");
        }
        throw new Error("Failed to fetch repositories");
      }

      const repos: GitHubRepo[] = await response.json();
      setFetchedRepos(repos);

      // Pre-select only NEW repos (not already in portfolio), non-fork, non-archived
      // Respect the available slots limit
      const initialSelected = new Set(
        repos
          .filter((r) => !r.fork && !r.archived && !existingRepoIds.has(r.id))
          .slice(0, Math.min(5, availableSlots))
          .map((r) => r.id)
      );
      setSelectedRepos(initialSelected);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "unknown";
      if (errorMessage === "rate_limit") {
        setFetchError("rate_limit");
      } else {
        setFetchError("fetch_failed");
      }
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [
    githubUsername,
    fetchedRepos.length,
    currentBio,
    currentLocation,
    existingRepoIds,
    availableSlots,
    supabase,
    userId,
  ]);

  useEffect(() => {
    if (open) {
      fetchRepos();
    }
  }, [open, fetchRepos]);

  // Reset state when modal closes
  useEffect(() => {
    if (!open) {
      setFetchedRepos([]);
      setSelectedRepos(new Set());
      setFetchError(null);
    }
  }, [open]);

  // Get filtered and sorted repos for the modal
  const filteredRepos = useMemo(() => {
    let filtered = [...fetchedRepos];
    if (excludeForks) {
      filtered = filtered.filter((r) => !r.fork);
    }
    if (excludeArchived) {
      filtered = filtered.filter((r) => !r.archived);
    }
    if (sortBy === "stars") {
      filtered.sort((a, b) => b.stargazers_count - a.stargazers_count);
    } else {
      filtered.sort(
        (a, b) =>
          new Date(b.pushed_at).getTime() - new Date(a.pushed_at).getTime()
      );
    }
    return filtered;
  }, [fetchedRepos, excludeForks, excludeArchived, sortBy]);

  // The Problem:
  // The old logic checked selectedRepos.size >= availableReposCount, but when you have more available repos than slots (like 15 repos but only 7 slots because you already have 3 projects), selecting 7 repos is NOT >= 15, so it showed "Select All" even though you selected everything you could.

  // The Fix:
  // // Maximum you CAN select = smaller of (available repos) or (available slots)
  // const maxSelectableCount = Math.min(availableReposCount, availableSlots);

  // // "All selected" = you've selected as many as you can
  // const allAvailableSelected = selectedRepos.size >= maxSelectableCount && selectedRepos.size > 0;

  // Now in your second scenario:
  // - 3 existing projects → 7 available slots (maxProjects - usedSlots = 10 - 3 = 7)
  // - 15 available repos (not in portfolio)
  // - maxSelectableCount = Math.min(15, 7) = 7
  // - When you select 7 repos: 7 >= 7 && 7 > 0 = true → Shows "Deselect All"

  // And in your first scenario:
  // - 2 existing projects → 8 available slots
  // - 2 available repos
  // - maxSelectableCount = Math.min(2, 8) = 2
  // - When you select 2 repos: 2 >= 2 && 2 > 0 = true → Shows "Deselect All"

  // Count how many repos are available to select (not already in portfolio)
  const availableReposCount = filteredRepos.filter(
    (r) => !existingRepoIds.has(r.id)
  ).length;

  // Maximum repos user can select is the smaller of: available repos OR available slots
  const maxSelectableCount = Math.min(availableReposCount, availableSlots);

  // "All selected" means user selected all they can (either all repos or hit the limit)
  const allAvailableSelected =
    selectedRepos.size >= maxSelectableCount && selectedRepos.size > 0;

  const isLimitReached = totalSelected >= maxProjects;

  // Toggle repo selection (only for NEW repos, not existing ones)
  const toggleRepoSelection = (repoId: number) => {
    // Don't allow toggling repos that are already in portfolio
    if (existingRepoIds.has(repoId)) return;

    const newSelected = new Set(selectedRepos);
    if (newSelected.has(repoId)) {
      newSelected.delete(repoId);
    } else {
      // Check if we can add more (respect limit)
      if (selectedRepos.size >= availableSlots) {
        toast.error(t("canOnlyImport", { count: availableSlots }));
        return;
      }
      newSelected.add(repoId);
    }
    setSelectedRepos(newSelected);
  };

  // Select/deselect all visible NEW repos (not existing ones)
  const toggleAllVisible = () => {
    if (allAvailableSelected) {
      setSelectedRepos(new Set());
      return;
    }

    const newReposOnly = filteredRepos.filter(
      (r) => !existingRepoIds.has(r.id)
    );

    const newSelected = new Set<number>();

    for (const r of newReposOnly) {
      if (newSelected.size >= availableSlots) break;
      newSelected.add(r.id);
    }

    setSelectedRepos(newSelected);
  };

  const handleImportSelected = async () => {
    setImporting(true);
    try {
      // Filter out repos that are already in portfolio
      const selectedReposList = fetchedRepos.filter(
        (r) => selectedRepos.has(r.id) && !existingRepoIds.has(r.id)
      );

      if (selectedReposList.length === 0) {
        toast.success(t("noNewProjects"));
        onOpenChange(false);
        setImporting(false);
        return;
      }

      // Start display_order from existing projects count
      const startOrder = existingProjects.length;

      const newProjects = selectedReposList.map((repo, index) => ({
        profile_id: userId,
        github_repo_id: repo.id,
        title: repo.name,
        description: repo.description,
        github_url: repo.html_url,
        demo_url: repo.homepage,
        stars: repo.stargazers_count,
        forks: repo.forks_count,
        tech_stack: repo.language
          ? [repo.language, ...(repo.topics || []).slice(0, 3)]
          : repo.topics?.slice(0, 4) || [],
        is_visible: true,
        is_featured: false,
        display_order: startOrder + index,
      }));

      // Insert only new projects
      const { data: insertedProjects, error } = await supabase
        .from("projects")
        .insert(newProjects)
        .select();

      if (error) throw error;

      toast.success(tToast("syncSuccess", { count: newProjects.length }));

      // Call the callback with the new projects
      if (insertedProjects) {
        onImportComplete(insertedProjects);
      }

      onOpenChange(false);
    } catch (error) {
      toast.error(tToast("syncFailed"));
      console.error(error);
    } finally {
      setImporting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[85vh] flex flex-col">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2">
              <Github className="w-5 h-5" />
              {t("title")}
            </DialogTitle>
          </div>
          <DialogDescription className="flex items-center justify-between">
            {loading
              ? t("loading")
              : t("reposFound", { count: fetchedRepos.length })}
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          </div>
        ) : fetchError ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="bg-destructive/10 p-4 rounded-full mb-4">
              <Info className="w-8 h-8 text-destructive" />
            </div>
            <h3 className="font-medium text-lg mb-2">
              {fetchError === "rate_limit"
                ? t("rateLimitTitle")
                : t("fetchErrorTitle")}
            </h3>
            <p className="text-sm text-muted-foreground max-w-sm mb-4">
              {fetchError === "rate_limit"
                ? t("rateLimitDescription")
                : t("fetchErrorDescription")}
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setFetchError(null);
                  setFetchedRepos([]);
                  fetchRepos();
                }}
              >
                {t("tryAgain")}
              </Button>
              <Button variant="secondary" onClick={() => onOpenChange(false)}>
                {t("skipImport")}
              </Button>
            </div>
          </div>
        ) : (
          <>
            {/* Batch Actions */}
            <div className="flex flex-wrap items-center gap-4 py-3 border-b">
              <div className="flex items-center gap-2">
                <Switch
                  id="exclude-forks"
                  checked={excludeForks}
                  onCheckedChange={setExcludeForks}
                />
                <Label
                  htmlFor="exclude-forks"
                  className="text-sm cursor-pointer"
                >
                  <GitFork className="w-3.5 h-3.5 inline mr-1" />
                  {t("excludeForks")}
                </Label>
              </div>

              <div className="flex items-center gap-2">
                <Switch
                  id="exclude-archived"
                  checked={excludeArchived}
                  onCheckedChange={setExcludeArchived}
                />
                <Label
                  htmlFor="exclude-archived"
                  className="text-sm cursor-pointer"
                >
                  <Archive className="w-3.5 h-3.5 inline mr-1" />
                  {t("excludeArchived")}
                </Label>
              </div>

              <div className="flex items-center gap-2 ml-auto">
                <Label className="text-sm text-muted-foreground">
                  {t("sort")}:
                </Label>
                <select
                  value={sortBy}
                  onChange={(e) =>
                    setSortBy(e.target.value as "stars" | "newest")
                  }
                  className="text-sm border rounded-md px-3 py-1.5 bg-background text-center appearance-none cursor-pointer min-w-[120px] pr-8 relative"
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`,
                    backgroundRepeat: "no-repeat",
                    backgroundPosition: "right 8px center",
                  }}
                >
                  <option value="stars">{t("mostStars")}</option>
                  <option value="newest">{t("newest")}</option>
                </select>
              </div>
            </div>

            {/* Select All */}
            <div className="flex items-center justify-between py-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleAllVisible}
                className="text-xs"
              >
                {allAvailableSelected ? t("deselectAll") : t("selectAll")}
              </Button>
              {isLimitReached ? (
                <div className="flex items-center gap-2 text-xs font-medium text-destructive">
                  <Info className="w-4 h-4" />
                  <span>{t("limitReached", { max: maxProjects })}</span>
                </div>
              ) : (
                <span className="text-xs text-muted-foreground">
                  {t("selectedCount", {
                    selected: totalSelected,
                    remaining: maxProjects - totalSelected,
                  })}
                </span>
              )}
            </div>

            {/* Repo List */}
            <div className="flex-1 overflow-y-auto space-y-1 min-h-0 pr-2">
              {filteredRepos.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground py-12">
                  <Archive className="w-10 h-10 mb-3 opacity-50" />
                  <p className="text-sm font-medium">{t("noRepositories")}</p>
                  <p className="text-xs mt-1">{t("noRepositoriesHint")}</p>
                </div>
              ) : (
                <div className="space-y-1">
                  {filteredRepos.map((repo) => {
                    const isExisting = existingRepoIds.has(repo.id);
                    const isDisabled =
                      !isExisting &&
                      isLimitReached &&
                      !selectedRepos.has(repo.id);

                    return (
                      <div
                        key={repo.id}
                        onClick={() =>
                          !isExisting &&
                          !isDisabled &&
                          toggleRepoSelection(repo.id)
                        }
                        className={`flex items-center justify-between p-3 rounded-lg border transition-colors ${
                          isExisting || isDisabled
                            ? "bg-muted/30 border-muted cursor-not-allowed opacity-60"
                            : selectedRepos.has(repo.id)
                            ? "bg-primary/5 border-primary/30 cursor-pointer"
                            : "hover:bg-muted/50 border-transparent cursor-pointer"
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          <Checkbox
                            checked={isExisting || selectedRepos.has(repo.id)}
                            onCheckedChange={() =>
                              !isDisabled && toggleRepoSelection(repo.id)
                            }
                            onClick={(e) => e.stopPropagation()}
                            disabled={isExisting || isDisabled}
                            className={isExisting ? "opacity-50" : ""}
                          />
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span
                                className={`font-medium text-sm truncate ${
                                  isExisting ? "text-muted-foreground" : ""
                                }`}
                              >
                                {repo.name}
                              </span>
                              {isExisting && (
                                <Badge
                                  variant="secondary"
                                  className="text-xs px-1.5 py-0 h-5 shrink-0 bg-green-500/10 text-green-600 border-green-500/20"
                                >
                                  <Check className="w-3 h-3 mr-0.5" />
                                  {t("alreadyInPortfolio")}
                                </Badge>
                              )}
                              {repo.language && !isExisting && (
                                <Badge
                                  variant="secondary"
                                  className="text-xs px-1.5 py-0 h-5 shrink-0"
                                >
                                  {repo.language}
                                </Badge>
                              )}
                              {repo.fork && (
                                <Badge
                                  variant="outline"
                                  className="text-xs px-1.5 py-0 h-5 shrink-0"
                                >
                                  <GitFork className="w-3 h-3 mr-0.5" />
                                  {t("fork")}
                                </Badge>
                              )}
                              {repo.archived && (
                                <Badge
                                  variant="outline"
                                  className="text-xs px-1.5 py-0 h-5 shrink-0 text-orange-600"
                                >
                                  <Archive className="w-3 h-3 mr-0.5" />
                                  {t("archived")}
                                </Badge>
                              )}
                            </div>
                            {repo.description && (
                              <p className="text-xs text-muted-foreground truncate mt-0.5">
                                {repo.description}
                              </p>
                            )}
                          </div>
                        </div>
                        <div
                          className={`flex items-center gap-1 shrink-0 ml-2 ${
                            repo.stargazers_count > 0 && !isExisting
                              ? "text-foreground"
                              : "text-muted-foreground/50"
                          }`}
                        >
                          <Star
                            className={`w-3.5 h-3.5 ${
                              repo.stargazers_count > 0 && !isExisting
                                ? "text-yellow-500 fill-yellow-500"
                                : "text-muted-foreground/40"
                            }`}
                          />
                          <span className="text-sm font-medium">
                            {repo.stargazers_count}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <DialogFooter className="pt-4 border-t flex-col sm:flex-row gap-3">
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => onOpenChange(false)}>
                  {t("cancel")}
                </Button>
                {selectedRepos.size === 0 ? (
                  <Button
                    variant="secondary"
                    onClick={() => onOpenChange(false)}
                  >
                    {t("skipImport")}
                  </Button>
                ) : (
                  <Button onClick={handleImportSelected} disabled={importing}>
                    {importing ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Check className="w-4 h-4 mr-2" />
                    )}
                    {t("importProjects", { count: selectedRepos.size })}
                  </Button>
                )}
              </div>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
