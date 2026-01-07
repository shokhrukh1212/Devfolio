"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Github,
  RefreshCw,
  Search,
  ExternalLink,
  Trash2,
  GitFork,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import type { Project } from "@/types";

interface ProjectsContentProps {
  initialProjects: Project[];
  userId: string;
}

export function ProjectsContent({ initialProjects, userId }: ProjectsContentProps) {
  const [projects, setProjects] = useState<Project[]>(initialProjects);
  const [search, setSearch] = useState("");
  const [syncOpen, setSyncOpen] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [githubUsername, setGithubUsername] = useState("");
  const supabase = createClient();
  const t = useTranslations("projects");
  const tCommon = useTranslations("common");
  const tToast = useTranslations("toast");

  const filteredProjects = projects.filter(
    (p) =>
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.description?.toLowerCase().includes(search.toLowerCase())
  );

  const handleUpdateProject = async (id: string, updates: Partial<Project>) => {
    const { error } = await supabase
      .from("projects")
      .update(updates)
      .eq("id", id);

    if (error) {
      toast.error(tToast("projectUpdateFailed"));
      return;
    }

    setProjects((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...updates } : p))
    );
    toast.success(tToast("projectUpdated"));
  };

  const handleDeleteProject = async (id: string) => {
    const { error } = await supabase.from("projects").delete().eq("id", id);

    if (error) {
      toast.error(tToast("projectDeleteFailed"));
      return;
    }

    setProjects((prev) => prev.filter((p) => p.id !== id));
    toast.success(tToast("projectDeleted"));
  };

  const handleSync = async () => {
    if (!githubUsername) return;

    setSyncing(true);
    try {
      // Fetch repos from GitHub API
      const response = await fetch(
        `https://api.github.com/users/${githubUsername}/repos?sort=stars&per_page=20`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch repositories");
      }

      const repos = await response.json();

      // Filter out forks and map to project format
      const newProjects = repos
        .filter((repo: { fork: boolean }) => !repo.fork)
        .slice(0, 10)
        .map((repo: {
          id: number;
          name: string;
          description: string | null;
          html_url: string;
          homepage: string | null;
          stargazers_count: number;
          forks_count: number;
          language: string | null;
          topics: string[];
        }, index: number) => ({
          profile_id: userId,
          github_repo_id: repo.id,
          title: repo.name,
          description: repo.description,
          github_url: repo.html_url,
          demo_url: repo.homepage,
          stars: repo.stargazers_count,
          forks: repo.forks_count,
          tech_stack: repo.language ? [repo.language, ...(repo.topics || []).slice(0, 3)] : repo.topics?.slice(0, 4) || [],
          is_visible: true,
          is_featured: false,
          display_order: index,
        }));

      // Upsert projects
      const { data, error } = await supabase
        .from("projects")
        .upsert(newProjects, {
          onConflict: "github_repo_id",
          ignoreDuplicates: false,
        })
        .select();

      if (error) throw error;

      // Refresh projects list
      const { data: refreshedProjects } = await supabase
        .from("projects")
        .select("*")
        .eq("profile_id", userId)
        .order("display_order", { ascending: true });

      if (refreshedProjects) {
        setProjects(refreshedProjects);
      }

      toast.success(tToast("syncSuccess", { count: newProjects.length }));
      setSyncOpen(false);
      setGithubUsername("");
    } catch (error) {
      toast.error(tToast("syncFailed"));
      console.error(error);
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold font-heading">{t("title")}</h1>
          <p className="text-muted-foreground mt-1">
            {t("description")}
          </p>
        </div>
        <Button onClick={() => setSyncOpen(true)}>
          <RefreshCw className="w-4 h-4 mr-2" />
          {t("syncFromGithub")}
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder={t("searchPlaceholder")}
          className="pl-10 max-w-sm"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Projects List */}
      {filteredProjects.length === 0 ? (
        <div className="text-center py-20 bg-muted/30 rounded-xl border border-dashed">
          <Github className="w-12 h-12 mx-auto text-muted-foreground opacity-50 mb-4" />
          <h3 className="text-lg font-medium">{t("noProjectsFound")}</h3>
          <p className="text-muted-foreground mb-6">
            {t("syncToGetStarted")}
          </p>
          <Button onClick={() => setSyncOpen(true)}>{t("syncProjects")}</Button>
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredProjects.map((project) => (
            <Card
              key={project.id}
              className="overflow-hidden transition-all hover:border-primary/50"
            >
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row gap-6 justify-between">
                  <div className="flex-1 space-y-3">
                    <div className="flex items-center gap-3">
                      <h3 className="text-lg font-bold">{project.title}</h3>
                      <Badge
                        variant="secondary"
                        className="font-normal text-muted-foreground"
                      >
                        {project.stars || 0} {t("stars")}
                      </Badge>
                      {project.is_featured && (
                        <Badge
                          variant="default"
                          className="bg-yellow-500/10 text-yellow-600 hover:bg-yellow-500/20 border-yellow-500/20"
                        >
                          {t("featured")}
                        </Badge>
                      )}
                    </div>

                    <p className="text-sm text-muted-foreground leading-relaxed max-w-2xl">
                      {project.description}
                    </p>

                    <div className="flex flex-wrap gap-2">
                      {project.tech_stack?.map((tech) => (
                        <span
                          key={tech}
                          className="text-xs bg-muted px-2 py-1 rounded-md text-muted-foreground font-medium"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>

                    <div className="flex items-center gap-4 text-sm text-muted-foreground pt-2">
                      {project.github_url && (
                        <a
                          href={project.github_url}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center hover:text-foreground"
                        >
                          <Github className="w-3.5 h-3.5 mr-1.5" /> {t("code")}
                        </a>
                      )}
                      {project.demo_url && (
                        <a
                          href={project.demo_url}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center hover:text-foreground"
                        >
                          <ExternalLink className="w-3.5 h-3.5 mr-1.5" /> {t("demo")}
                        </a>
                      )}
                      <span className="flex items-center">
                        <GitFork className="w-3.5 h-3.5 mr-1.5" /> {project.forks}{" "}
                        {t("forks")}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-row md:flex-col items-center md:items-end gap-4 border-t md:border-t-0 md:border-l pt-4 md:pt-0 md:pl-6 border-border">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-muted-foreground">
                        {t("visible")}
                      </span>
                      <Switch
                        checked={project.is_visible}
                        onCheckedChange={(checked) =>
                          handleUpdateProject(project.id, { is_visible: checked })
                        }
                      />
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-muted-foreground">
                        {t("featured")}
                      </span>
                      <Switch
                        checked={project.is_featured}
                        onCheckedChange={(checked) =>
                          handleUpdateProject(project.id, { is_featured: checked })
                        }
                      />
                    </div>

                    <div className="flex-1" />

                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>
                            {t("deleteConfirm.title")}
                          </AlertDialogTitle>
                          <AlertDialogDescription>
                            {t("deleteConfirm.description")}
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>{tCommon("cancel")}</AlertDialogCancel>
                          <AlertDialogAction
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            onClick={() => handleDeleteProject(project.id)}
                          >
                            {tCommon("delete")}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Sync Dialog */}
      <Dialog open={syncOpen} onOpenChange={setSyncOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t("sync.title")}</DialogTitle>
            <DialogDescription>
              {t("sync.description")}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="username">{t("sync.usernameLabel")}</Label>
              <Input
                id="username"
                placeholder={t("sync.usernamePlaceholder")}
                value={githubUsername}
                onChange={(e) => setGithubUsername(e.target.value)}
              />
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setSyncOpen(false)}>
              {tCommon("cancel")}
            </Button>
            <Button onClick={handleSync} disabled={syncing || !githubUsername}>
              {syncing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t("sync.syncing")}
                </>
              ) : (
                <>
                  <Github className="mr-2 h-4 w-4" />
                  {t("syncProjects")}
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
