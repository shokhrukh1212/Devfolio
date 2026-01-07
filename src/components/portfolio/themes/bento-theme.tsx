"use client";

import { motion } from "framer-motion";
import {
  Github,
  Globe,
  Linkedin,
  MapPin,
  Star,
  GitFork,
  ArrowUpRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { ThemeProps } from "@/types";

export function BentoTheme({ profile, projects }: ThemeProps) {
  const visibleProjects = projects
    .filter((p) => p.is_visible)
    .sort((a, b) => a.display_order - b.display_order);

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 font-sans p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-4">
        {/* Profile Header Block */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="md:col-span-8 bg-white rounded-3xl p-8 shadow-sm border border-zinc-100 flex flex-col md:flex-row gap-8 items-start md:items-center"
          >
            {profile.avatar_url && (
              <img
                src={profile.avatar_url}
                alt={profile.display_name || ""}
                className="w-32 h-32 rounded-2xl object-cover shadow-sm"
              />
            )}
            <div className="space-y-4">
              <div>
                <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
                  {profile.display_name}
                </h1>
                <p className="text-zinc-500 text-lg mt-1 font-medium">
                  @{profile.username}
                </p>
              </div>
              <p className="text-lg text-zinc-600 max-w-xl leading-relaxed">
                {profile.bio}
              </p>

              <div className="flex flex-wrap gap-2">
                {profile.location && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full bg-zinc-100 text-zinc-600 text-sm font-medium">
                    <MapPin className="w-3 h-3 mr-2" />
                    {profile.location}
                  </span>
                )}
                {profile.website_url && (
                  <a
                    href={profile.website_url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center px-3 py-1 rounded-full bg-indigo-50 text-indigo-600 text-sm font-medium hover:bg-indigo-100 transition-colors"
                  >
                    <Globe className="w-3 h-3 mr-2" />
                    Website
                  </a>
                )}
              </div>
            </div>
          </motion.div>

          {/* Social Block */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="md:col-span-4 bg-zinc-900 text-white rounded-3xl p-8 shadow-sm flex flex-col justify-center gap-6"
          >
            <h2 className="text-2xl font-bold">Connect</h2>
            <div className="flex flex-col gap-4">
              {profile.github_url && (
                <a
                  href={profile.github_url}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-between p-4 rounded-xl bg-white/10 hover:bg-white/20 transition-colors"
                >
                  <span className="font-medium flex items-center gap-2">
                    <Github className="w-5 h-5" /> GitHub
                  </span>
                  <ArrowUpRight className="w-4 h-4" />
                </a>
              )}
              {profile.linkedin_url && (
                <a
                  href={profile.linkedin_url}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-between p-4 rounded-xl bg-[#0077b5]/20 hover:bg-[#0077b5]/30 transition-colors"
                >
                  <span className="font-medium flex items-center gap-2">
                    <Linkedin className="w-5 h-5" /> LinkedIn
                  </span>
                  <ArrowUpRight className="w-4 h-4" />
                </a>
              )}
            </div>
          </motion.div>
        </div>

        {/* Projects Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {visibleProjects.map((project, i) => (
            <motion.a
              href={project.demo_url || project.github_url || "#"}
              target="_blank"
              rel="noreferrer"
              key={project.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 + i * 0.05 }}
              className={cn(
                "group bg-white rounded-3xl p-6 border border-zinc-100 shadow-sm hover:shadow-md transition-all hover:-translate-y-1 flex flex-col justify-between",
                project.is_featured
                  ? "md:col-span-2 lg:col-span-2 bg-gradient-to-br from-white to-indigo-50/50"
                  : ""
              )}
            >
              <div className="space-y-4">
                <div className="flex justify-between items-start">
                  <div className="bg-zinc-100 p-3 rounded-2xl group-hover:bg-indigo-100 group-hover:text-indigo-600 transition-colors">
                    <Github className="w-6 h-6" />
                  </div>
                  <div className="flex gap-3 text-zinc-400 text-sm">
                    {project.stars !== null && project.stars > 0 && (
                      <span className="flex items-center gap-1">
                        <Star className="w-3 h-3 fill-current" /> {project.stars}
                      </span>
                    )}
                    {project.forks !== null && project.forks > 0 && (
                      <span className="flex items-center gap-1">
                        <GitFork className="w-3 h-3" /> {project.forks}
                      </span>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-bold mb-2">{project.title}</h3>
                  <p className="text-zinc-600 text-sm leading-relaxed line-clamp-3">
                    {project.description}
                  </p>
                </div>
              </div>

              <div className="mt-6">
                <div className="flex flex-wrap gap-2">
                  {project.tech_stack?.slice(0, 3).map((tech) => (
                    <span
                      key={tech}
                      className="px-2 py-1 rounded-md bg-zinc-100 text-xs font-semibold text-zinc-600 border border-zinc-200"
                    >
                      {tech}
                    </span>
                  ))}
                  {(project.tech_stack?.length || 0) > 3 && (
                    <span className="px-2 py-1 rounded-md bg-zinc-50 text-xs font-medium text-zinc-400">
                      +{project.tech_stack!.length - 3}
                    </span>
                  )}
                </div>
              </div>
            </motion.a>
          ))}
        </div>

        <footer className="text-center py-8 text-zinc-400 text-sm font-medium">
          Built with Devfolio
        </footer>
      </div>
    </div>
  );
}
