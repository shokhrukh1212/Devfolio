"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
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
  Pencil,
} from "lucide-react";
import { GitHubSyncModal } from "@/components/github-sync-modal";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import type { Project, PlanTier } from "@/types";

interface ProjectsContentProps {
  initialProjects: Project[];
  userId: string;
  githubUsername: string;
  planTier?: PlanTier;
  currentBio?: string | null;
  currentLocation?: string | null;
}

export function ProjectsContent({
  initialProjects,
  userId,
  githubUsername,
  planTier = "free",
  currentBio,
  currentLocation,
}: ProjectsContentProps) {
  const [projects, setProjects] = useState<Project[]>(initialProjects);
  const [search, setSearch] = useState("");
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [savingEdit, setSavingEdit] = useState(false);
  const [editForm, setEditForm] = useState({
    title: "",
    description: "",
    demo_url: "",
  });

  // GitHub sync modal state
  const [showSyncModal, setShowSyncModal] = useState(false);
  const [syncing, setSyncing] = useState(false);

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

  const handleSync = () => {
    if (!githubUsername) {
      toast.error(tToast("syncFailed"));
      return;
    }
    setSyncing(true);
    setShowSyncModal(true);
  };

  const handleImportComplete = (newProjects: Project[]) => {
    setProjects((prev) => [...prev, ...newProjects]);
    setSyncing(false);
  };

  const handleModalClose = (open: boolean) => {
    setShowSyncModal(open);
    if (!open) {
      setSyncing(false);
    }
  };

  const handleEditProject = (project: Project) => {
    setEditingProject(project);
    setEditForm({
      title: project.title,
      description: project.description || "",
      demo_url: project.demo_url || "",
    });
  };

  const handleSaveEdit = async () => {
    if (!editingProject || savingEdit) return;

    setSavingEdit(true);
    try {
      const { error } = await supabase
        .from("projects")
        .update({
          title: editForm.title,
          description: editForm.description || null,
          demo_url: editForm.demo_url || null,
        })
        .eq("id", editingProject.id);

      if (error) {
        toast.error(tToast("projectUpdateFailed"));
        return;
      }

      setProjects((prev) =>
        prev.map((p) =>
          p.id === editingProject.id
            ? {
                ...p,
                title: editForm.title,
                description: editForm.description || null,
                demo_url: editForm.demo_url || null,
              }
            : p
        )
      );
      toast.success(tToast("projectUpdated"));
      setEditingProject(null);
    } finally {
      setSavingEdit(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold font-heading">{t("title")}</h1>
          <p className="text-muted-foreground mt-1">{t("description")}</p>
        </div>
        <Button onClick={handleSync} disabled={syncing}>
          {syncing ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <RefreshCw className="w-4 h-4 mr-2" />
          )}
          {syncing ? t("sync.syncing") : t("syncFromGithub")}
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
          <p className="text-muted-foreground mb-6">{t("syncToGetStarted")}</p>
          <Button onClick={handleSync} disabled={syncing}>
            {syncing ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4 mr-2" />
            )}
            {syncing ? t("sync.syncing") : t("syncProjects")}
          </Button>
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
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
                        onClick={() => handleEditProject(project)}
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </Button>
                      <Badge
                        variant="secondary"
                        className="font-normal text-muted-foreground"
                      >
                        {project.stars || 0}{" "}
                        {project.stars < 2 ? "star" : "stars"}
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
                          <Github className="w-3.5 h-3.5 mr-1.5" /> {"Code"}
                        </a>
                      )}
                      {project.demo_url && (
                        <a
                          href={project.demo_url}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center hover:text-foreground"
                        >
                          <ExternalLink className="w-3.5 h-3.5 mr-1.5" />{" "}
                          {"Demo"}
                        </a>
                      )}
                      <span className="flex items-center">
                        <GitFork className="w-3.5 h-3.5 mr-1.5" />{" "}
                        {project.forks} {project.forks < 2 ? "fork" : "forks"}
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
                          handleUpdateProject(project.id, {
                            is_visible: checked,
                          })
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
                          handleUpdateProject(project.id, {
                            is_featured: checked,
                          })
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
                          <AlertDialogCancel>
                            {tCommon("cancel")}
                          </AlertDialogCancel>
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

      {/* Edit Project Dialog */}
      <Dialog
        open={!!editingProject}
        onOpenChange={(open) => !open && setEditingProject(null)}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t("edit.title")}</DialogTitle>
            <DialogDescription>{t("edit.description")}</DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">{t("edit.projectTitle")}</Label>
              <Input
                id="title"
                value={editForm.title}
                onChange={(e) =>
                  setEditForm({ ...editForm, title: e.target.value })
                }
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">
                {t("edit.projectDescription")}
              </Label>
              <Textarea
                id="description"
                value={editForm.description}
                onChange={(e) =>
                  setEditForm({ ...editForm, description: e.target.value })
                }
                className="resize-none min-h-[100px]"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="demo_url">{t("edit.demoUrl")}</Label>
              <Input
                id="demo_url"
                placeholder="https://..."
                value={editForm.demo_url}
                onChange={(e) =>
                  setEditForm({ ...editForm, demo_url: e.target.value })
                }
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setEditingProject(null)}
              disabled={savingEdit}
            >
              {tCommon("cancel")}
            </Button>
            <Button onClick={handleSaveEdit} disabled={savingEdit}>
              {savingEdit ? <>{tCommon("saving")}</> : tCommon("save")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* GitHub Sync Modal */}
      <GitHubSyncModal
        open={showSyncModal}
        onOpenChange={handleModalClose}
        githubUsername={githubUsername}
        userId={userId}
        existingProjects={projects}
        planTier={planTier}
        currentBio={currentBio}
        currentLocation={currentLocation}
        onImportComplete={handleImportComplete}
      />
    </div>
  );
}
