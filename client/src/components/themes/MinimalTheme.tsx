import { motion } from "framer-motion";
import { ProfileResponse } from "@shared/schema";
import { Github, Globe, Linkedin, Mail, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";

export function MinimalTheme({ data }: { data: ProfileResponse }) {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className="min-h-screen bg-white text-zinc-900 font-sans selection:bg-zinc-900 selection:text-white">
      <div className="max-w-3xl mx-auto px-6 py-24">
        <motion.div 
          initial="hidden" 
          animate="show" 
          variants={container}
          className="space-y-16"
        >
          {/* Header */}
          <motion.header variants={item} className="space-y-6">
            <div className="flex items-center gap-6">
              {data.avatarUrl && (
                <img 
                  src={data.avatarUrl} 
                  alt={data.displayName || "Avatar"} 
                  className="w-20 h-20 rounded-full object-cover grayscale"
                />
              )}
              <div>
                <h1 className="text-4xl font-bold tracking-tight">
                  {data.displayName || data.username}
                </h1>
                {data.location && (
                  <p className="flex items-center text-zinc-500 mt-2">
                    <MapPin className="w-4 h-4 mr-1" />
                    {data.location}
                  </p>
                )}
              </div>
            </div>
            
            <p className="text-xl text-zinc-600 leading-relaxed max-w-2xl">
              {data.bio}
            </p>

            <div className="flex gap-4">
              {data.githubUrl && (
                <a href={data.githubUrl} target="_blank" rel="noreferrer" className="p-2 rounded-full hover:bg-zinc-100 transition-colors">
                  <Github className="w-5 h-5" />
                </a>
              )}
              {data.linkedinUrl && (
                <a href={data.linkedinUrl} target="_blank" rel="noreferrer" className="p-2 rounded-full hover:bg-zinc-100 transition-colors">
                  <Linkedin className="w-5 h-5" />
                </a>
              )}
              {data.websiteUrl && (
                <a href={data.websiteUrl} target="_blank" rel="noreferrer" className="p-2 rounded-full hover:bg-zinc-100 transition-colors">
                  <Globe className="w-5 h-5" />
                </a>
              )}
              {data.email && (
                <a href={`mailto:${data.email}`} className="p-2 rounded-full hover:bg-zinc-100 transition-colors">
                  <Mail className="w-5 h-5" />
                </a>
              )}
            </div>
          </motion.header>

          <div className="h-px bg-zinc-100 w-full" />

          {/* Projects */}
          <section className="space-y-12">
            <motion.h2 variants={item} className="text-sm font-semibold uppercase tracking-wider text-zinc-400">
              Selected Projects
            </motion.h2>

            <div className="grid gap-12">
              {data.projects?.filter(p => p.isVisible).map((project) => (
                <motion.article key={project.id} variants={item} className="group">
                  <div className="flex justify-between items-baseline mb-2">
                    <h3 className="text-2xl font-semibold group-hover:underline decoration-1 underline-offset-4">
                      {project.title}
                    </h3>
                    <div className="flex gap-3">
                      {project.demoUrl && (
                        <a href={project.demoUrl} target="_blank" rel="noreferrer" className="text-sm font-medium hover:text-zinc-500">
                          View Demo ↗
                        </a>
                      )}
                      {project.githubUrl && (
                        <a href={project.githubUrl} target="_blank" rel="noreferrer" className="text-sm font-medium hover:text-zinc-500">
                          Code ↗
                        </a>
                      )}
                    </div>
                  </div>
                  
                  <p className="text-zinc-600 mb-4 leading-relaxed">
                    {project.description}
                  </p>

                  <div className="flex flex-wrap gap-2">
                    {project.techStack?.map(tech => (
                      <span key={tech} className="text-xs font-medium text-zinc-400 bg-zinc-50 px-2 py-1 rounded">
                        {tech}
                      </span>
                    ))}
                  </div>
                </motion.article>
              ))}
            </div>
          </section>

          <motion.footer variants={item} className="pt-24 pb-12 text-center text-sm text-zinc-400">
            <p>© {new Date().getFullYear()} {data.displayName}. Built with Developer Portfolio.</p>
          </motion.footer>
        </motion.div>
      </div>
    </div>
  );
}
