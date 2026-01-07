import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth, registerAuthRoutes } from "./auth";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import { insertProfileSchema } from "@shared/schema";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Setup Replit Auth
  setupAuth(app);
  registerAuthRoutes(app);

  // Helper to ensure auth
  const requireAuth = (req: any, res: any, next: any) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    next();
  };

  // === Profile Routes ===
  
  app.get(api.profile.get.path, requireAuth, async (req, res) => {
    const profile = await storage.getProfileByUserId(req.user!.id);
    if (!profile) {
      return res.status(404).json({ message: "Profile not found" });
    }
    res.json(profile);
  });

  app.patch(api.profile.update.path, requireAuth, async (req, res) => {
    try {
      const input = api.profile.update.input.parse(req.body);
      let profile = await storage.getProfileByUserId(req.user!.id);
      
      if (!profile) {
        // Create if doesn't exist (first time)
        // Ensure username is provided for creation
        if (!input.username) {
           // Default to user's replit username if available, or error
           if (req.user!.username) {
             input.username = req.user!.username;
           } else {
             return res.status(400).json({ message: "Username required for profile creation" });
           }
        }
        
        // Validate full schema for creation
        const createInput = insertProfileSchema.parse({
            ...input,
            userId: req.user!.id
        });
        
        profile = await storage.createProfile(req.user!.id, createInput);
      } else {
        profile = await storage.updateProfile(profile.id, input);
      }
      
      res.json(profile);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      throw err;
    }
  });

  // Public Portfolio Route
  app.get(api.profile.getByUsername.path, async (req, res) => {
    const profile = await storage.getProfileByUsername(req.params.username);
    if (!profile) {
      return res.status(404).json({ message: "Profile not found" });
    }
    const projects = await storage.getProjects(profile.id);
    // Filter visible projects for public view
    const visibleProjects = projects.filter(p => p.isVisible);
    
    res.json({ ...profile, projects: visibleProjects });
  });

  // === Projects Routes ===

  app.get(api.projects.list.path, requireAuth, async (req, res) => {
    const profile = await storage.getProfileByUserId(req.user!.id);
    if (!profile) {
      return res.json([]); // No profile = no projects
    }
    const projects = await storage.getProjects(profile.id);
    res.json(projects);
  });

  app.post(api.projects.create.path, requireAuth, async (req, res) => {
    const profile = await storage.getProfileByUserId(req.user!.id);
    if (!profile) {
      return res.status(400).json({ message: "Create a profile first" });
    }
    
    try {
      const input = api.projects.create.input.parse(req.body);
      const project = await storage.createProject({ ...input, profileId: profile.id });
      res.status(201).json(project);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      throw err;
    }
  });

  app.put(api.projects.update.path, requireAuth, async (req, res) => {
    const profile = await storage.getProfileByUserId(req.user!.id);
    if (!profile) return res.status(401).json({ message: "Unauthorized" });

    const projectId = Number(req.params.id);
    const existing = await storage.getProject(projectId);
    
    if (!existing || existing.profileId !== profile.id) {
      return res.status(404).json({ message: "Project not found" });
    }

    try {
      const input = api.projects.update.input.parse(req.body);
      const updated = await storage.updateProject(projectId, input);
      res.json(updated);
    } catch (err) {
       if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      throw err;
    }
  });

  app.delete(api.projects.delete.path, requireAuth, async (req, res) => {
    const profile = await storage.getProfileByUserId(req.user!.id);
    if (!profile) return res.status(401).json({ message: "Unauthorized" });

    const projectId = Number(req.params.id);
    const existing = await storage.getProject(projectId);
    
    if (!existing || existing.profileId !== profile.id) {
      return res.status(404).json({ message: "Project not found" });
    }

    await storage.deleteProject(projectId);
    res.status(204).send();
  });

  // === GitHub Sync Route ===
  app.post(api.projects.sync.path, requireAuth, async (req, res) => {
    const profile = await storage.getProfileByUserId(req.user!.id);
    if (!profile) {
      return res.status(400).json({ message: "Create a profile first" });
    }

    try {
      const { githubUsername, githubToken } = api.projects.sync.input.parse(req.body);
      
      // Basic GitHub API fetch
      // In a real app, use Octokit or specific headers
      const headers: Record<string, string> = {
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'Devfolio-Generator'
      };
      
      if (githubToken) {
        headers['Authorization'] = `token ${githubToken}`;
      }

      const response = await fetch(`https://api.github.com/users/${githubUsername}/repos?sort=updated&per_page=100`, { headers });
      
      if (!response.ok) {
        return res.status(response.status).json({ message: "Failed to fetch from GitHub" });
      }

      const repos = await response.json();
      const syncedProjects = [];

      // Filter for non-forks unless requested? Spec says "filter forks"
      const nonForks = repos.filter((r: any) => !r.fork);
      
      // We only take top 10 by stars for now to avoid spam
      const topRepos = nonForks.sort((a: any, b: any) => b.stargazers_count - a.stargazers_count).slice(0, 10);

      for (const repo of topRepos) {
        // Check if project already exists by repo ID
        // Since we don't have getProjectByGithubId in storage, we just add for now or check manually
        // For MVP, let's just create new ones if they don't exist in the list we just fetched?
        // Actually, preventing duplicates is important.
        // Let's check current projects
        const currentProjects = await storage.getProjects(profile.id);
        const exists = currentProjects.find(p => p.githubRepoId === String(repo.id));

        if (!exists) {
           const newProject = await storage.createProject({
             profileId: profile.id,
             githubRepoId: String(repo.id),
             title: repo.name,
             description: repo.description || "",
             githubUrl: repo.html_url,
             demoUrl: repo.homepage || "",
             techStack: [repo.language].filter(Boolean), // simplistic
             stars: repo.stargazers_count,
             forks: repo.forks_count,
             isVisible: true,
             isFeatured: false,
             displayOrder: 0
           });
           syncedProjects.push(newProject);
        }
      }

      const allProjects = await storage.getProjects(profile.id);
      res.json(allProjects);

    } catch (err) {
      console.error("Sync error:", err);
      res.status(500).json({ message: "Internal server error during sync" });
    }
  });

  // === Analytics Routes ===
  
  app.post(api.analytics.track.path, async (req, res) => {
    try {
      const input = api.analytics.track.input.parse(req.body);
      await storage.createAnalyticsEvent(input);
      res.status(201).send();
    } catch (err) {
      res.status(400).send();
    }
  });

  return httpServer;
}
