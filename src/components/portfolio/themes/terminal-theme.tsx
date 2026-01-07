"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import type { ThemeProps } from "@/types";

export function TerminalTheme({ profile, projects }: ThemeProps) {
  const [typedText, setTypedText] = useState("");
  const fullText = `> Initializing profile for ${profile.username}...\n> Loading modules... DONE\n> Rendering bio...`;

  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      setTypedText(fullText.slice(0, i));
      i++;
      if (i > fullText.length) clearInterval(interval);
    }, 30);
    return () => clearInterval(interval);
  }, [fullText]);

  const visibleProjects = projects
    .filter((p) => p.is_visible)
    .sort((a, b) => a.display_order - b.display_order);

  return (
    <div className="min-h-screen bg-[#0d1117] text-[#58a6ff] font-mono p-6 md:p-12 overflow-x-hidden">
      <div className="max-w-4xl mx-auto border border-[#30363d] rounded-lg bg-[#010409] shadow-2xl overflow-hidden">
        {/* Terminal Header */}
        <div className="bg-[#161b22] px-4 py-2 flex items-center gap-2 border-b border-[#30363d]">
          <div className="w-3 h-3 rounded-full bg-[#ff5f56]" />
          <div className="w-3 h-3 rounded-full bg-[#ffbd2e]" />
          <div className="w-3 h-3 rounded-full bg-[#27c93f]" />
          <div className="ml-4 text-xs text-[#8b949e]">
            user@{profile.username}: ~
          </div>
        </div>

        <div className="p-6 md:p-8 space-y-12">
          {/* Header Section */}
          <div className="space-y-4">
            <div className="text-[#8b949e] whitespace-pre-line min-h-[4.5rem]">
              {typedText}
              <span className="animate-pulse">_</span>
            </div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.5 }}
              className="border-l-2 border-[#30363d] pl-6 py-2"
            >
              <h1 className="text-4xl md:text-5xl font-bold text-[#c9d1d9] mb-4">
                {profile.display_name}
              </h1>
              <p className="text-lg text-[#8b949e] max-w-2xl leading-relaxed">
                {profile.bio}
              </p>

              <div className="flex flex-wrap gap-6 mt-6 text-sm">
                {profile.github_url && (
                  <a
                    href={profile.github_url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[#58a6ff] hover:underline underline-offset-4"
                  >
                    github_url: &quot;{profile.github_url}&quot;
                  </a>
                )}
                {profile.twitter_url && (
                  <a
                    href={profile.twitter_url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[#58a6ff] hover:underline underline-offset-4"
                  >
                    twitter_url: &quot;{profile.twitter_url}&quot;
                  </a>
                )}
              </div>
            </motion.div>
          </div>

          {/* Projects Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 2 }}
          >
            <div className="flex items-center gap-4 mb-6">
              <span className="text-[#ff7b72]">$</span>
              <span className="text-[#c9d1d9]">ls -la ./projects</span>
            </div>

            <div className="grid gap-6">
              {visibleProjects.map((project) => (
                <div
                  key={project.id}
                  className="border border-[#30363d] rounded p-4 hover:border-[#58a6ff] transition-colors group bg-[#0d1117]"
                >
                  <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-2 mb-3">
                    <h3 className="text-xl font-bold text-[#c9d1d9] group-hover:text-[#58a6ff]">
                      {project.title}
                    </h3>
                    <div className="flex gap-4 text-xs font-medium text-[#8b949e]">
                      {project.stars ? <span>★ {project.stars}</span> : null}
                      {project.forks ? <span>⑂ {project.forks}</span> : null}
                      <span>
                        {new Date(project.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  <p className="text-[#8b949e] text-sm mb-4 font-sans">
                    {project.description}
                  </p>

                  <div className="flex flex-wrap gap-2 mb-4">
                    {project.tech_stack?.map((tech) => (
                      <span
                        key={tech}
                        className="text-xs text-[#79c0ff] bg-[#388bfd]/10 px-2 py-0.5 rounded border border-[#388bfd]/40"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>

                  <div className="flex gap-4 text-sm">
                    {project.demo_url && (
                      <a
                        href={project.demo_url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[#2ea043] hover:underline"
                      >
                        ./view-demo.sh
                      </a>
                    )}
                    {project.github_url && (
                      <a
                        href={project.github_url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[#d2a8ff] hover:underline"
                      >
                        ./view-source.sh
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Footer */}
          <div className="text-center text-[#8b949e] text-sm pt-8">
            <span className="text-[#ff7b72]">$</span> echo &quot;Built with
            Devfolio&quot;
          </div>
        </div>
      </div>
    </div>
  );
}
