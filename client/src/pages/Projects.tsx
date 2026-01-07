import { useState } from "react";
import { Layout } from "@/components/Layout";
import { useProjects, useUpdateProject, useDeleteProject } from "@/hooks/use-projects";
import { SyncDialog } from "@/components/SyncDialog";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Github, 
  RefreshCw, 
  Search, 
  Star, 
  GitFork, 
  ExternalLink, 
  Trash2, 
  Eye, 
  EyeOff 
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
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

export default function Projects() {
  const { data: projects, isLoading } = useProjects();
  const { mutate: updateProject } = useUpdateProject();
  const { mutate: deleteProject } = useDeleteProject();
  const [search, setSearch] = useState("");
  const [syncOpen, setSyncOpen] = useState(false);

  const filteredProjects = projects?.filter(p => 
    p.title.toLowerCase().includes(search.toLowerCase()) || 
    p.description?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold font-heading">Projects</h1>
            <p className="text-muted-foreground mt-1">Manage which repositories appear on your portfolio.</p>
          </div>
          <Button onClick={() => setSyncOpen(true)}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Sync from GitHub
          </Button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="Search projects..." 
            className="pl-10 max-w-sm"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* List */}
        {isLoading ? (
          <div className="grid gap-4">
            <Skeleton className="h-32 w-full rounded-xl" />
            <Skeleton className="h-32 w-full rounded-xl" />
            <Skeleton className="h-32 w-full rounded-xl" />
          </div>
        ) : filteredProjects?.length === 0 ? (
          <div className="text-center py-20 bg-muted/30 rounded-xl border border-dashed">
            <Github className="w-12 h-12 mx-auto text-muted-foreground opacity-50 mb-4" />
            <h3 className="text-lg font-medium">No projects found</h3>
            <p className="text-muted-foreground mb-6">Sync your GitHub repositories to get started.</p>
            <Button onClick={() => setSyncOpen(true)}>Sync Projects</Button>
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredProjects?.map((project) => (
              <Card key={project.id} className="overflow-hidden transition-all hover:border-primary/50">
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row gap-6 justify-between">
                    <div className="flex-1 space-y-3">
                      <div className="flex items-center gap-3">
                        <h3 className="text-lg font-bold">{project.title}</h3>
                        <Badge variant="secondary" className="font-normal text-muted-foreground">
                          {project.stars || 0} stars
                        </Badge>
                        {project.isFeatured && (
                          <Badge variant="default" className="bg-yellow-500/10 text-yellow-600 hover:bg-yellow-500/20 border-yellow-500/20">
                            Featured
                          </Badge>
                        )}
                      </div>
                      
                      <p className="text-sm text-muted-foreground leading-relaxed max-w-2xl">
                        {project.description}
                      </p>

                      <div className="flex flex-wrap gap-2">
                        {project.techStack?.map(tech => (
                          <span key={tech} className="text-xs bg-muted px-2 py-1 rounded-md text-muted-foreground font-medium">
                            {tech}
                          </span>
                        ))}
                      </div>

                      <div className="flex items-center gap-4 text-sm text-muted-foreground pt-2">
                        {project.githubUrl && (
                          <a href={project.githubUrl} target="_blank" rel="noreferrer" className="flex items-center hover:text-foreground">
                            <Github className="w-3.5 h-3.5 mr-1.5" /> Code
                          </a>
                        )}
                        {project.demoUrl && (
                          <a href={project.demoUrl} target="_blank" rel="noreferrer" className="flex items-center hover:text-foreground">
                            <ExternalLink className="w-3.5 h-3.5 mr-1.5" /> Demo
                          </a>
                        )}
                        <span className="flex items-center">
                          <GitFork className="w-3.5 h-3.5 mr-1.5" /> {project.forks} forks
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-row md:flex-col items-center md:items-end gap-4 border-t md:border-t-0 md:border-l pt-4 md:pt-0 md:pl-6 border-border">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-muted-foreground">Visible</span>
                        <Switch 
                          checked={project.isVisible} 
                          onCheckedChange={(checked) => updateProject({ id: project.id, isVisible: checked })}
                        />
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-muted-foreground">Featured</span>
                        <Switch 
                          checked={project.isFeatured} 
                          onCheckedChange={(checked) => updateProject({ id: project.id, isFeatured: checked })}
                        />
                      </div>

                      <div className="flex-1" />

                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive hover:bg-destructive/10">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This action cannot be undone. This will permanently remove the project
                              from your portfolio.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction 
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              onClick={() => deleteProject(project.id)}
                            >
                              Delete
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

        <SyncDialog open={syncOpen} onOpenChange={setSyncOpen} />
      </div>
    </Layout>
  );
}
