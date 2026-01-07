"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Check, LayoutTemplate, Terminal, Type } from "lucide-react";
import { toast } from "sonner";
import type { Profile, ThemeName } from "@/types";

interface ThemeOption {
  id: ThemeName;
  name: string;
  description: string;
  icon: React.ReactNode;
  colors: string;
}

const themes: ThemeOption[] = [
  {
    id: "minimal",
    name: "Minimal",
    description: "Clean typography and whitespace for a sophisticated look.",
    icon: <Type className="w-5 h-5" />,
    colors: "bg-white border-zinc-200",
  },
  {
    id: "bento",
    name: "Bento",
    description: "Grid-based modular layout inspired by modern dashboard design.",
    icon: <LayoutTemplate className="w-5 h-5" />,
    colors: "bg-zinc-50 border-zinc-200",
  },
  {
    id: "terminal",
    name: "Terminal",
    description: "Monospace fonts and high contrast for the hacker aesthetic.",
    icon: <Terminal className="w-5 h-5" />,
    colors: "bg-zinc-950 border-zinc-800 text-green-400",
  },
];

interface ThemeContentProps {
  profile: Profile | null;
}

export function ThemeContent({ profile }: ThemeContentProps) {
  const [currentTheme, setCurrentTheme] = useState<ThemeName>(
    profile?.theme || "minimal"
  );
  const [isUpdating, setIsUpdating] = useState(false);
  const supabase = createClient();

  const handleThemeChange = async (themeId: ThemeName) => {
    setIsUpdating(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ theme: themeId })
        .eq("id", profile?.id);

      if (error) throw error;

      setCurrentTheme(themeId);
      toast.success(`Theme changed to ${themeId}`);
    } catch (error) {
      toast.error("Failed to update theme");
      console.error(error);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold font-heading">Theme Selection</h1>
        <p className="text-muted-foreground mt-1">
          Choose how your portfolio looks to the world. Changes are applied
          immediately.
        </p>
      </div>

      {/* Theme Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {themes.map((theme) => {
          const isActive = currentTheme === theme.id;

          return (
            <button
              key={theme.id}
              onClick={() => handleThemeChange(theme.id)}
              disabled={isUpdating}
              className={cn(
                "relative flex flex-col items-start p-6 text-left rounded-xl transition-all duration-200 border-2 group hover:-translate-y-1",
                isActive
                  ? "border-primary ring-2 ring-primary/20 shadow-lg shadow-primary/10"
                  : "border-border hover:border-primary/50 hover:shadow-md",
                theme.colors
              )}
            >
              {isActive && (
                <div className="absolute top-4 right-4 text-primary bg-primary/10 p-1 rounded-full">
                  <Check className="w-4 h-4" />
                </div>
              )}

              <div
                className={cn(
                  "mb-4 p-3 rounded-lg",
                  theme.id === "terminal"
                    ? "bg-zinc-900 text-green-500 border border-zinc-800"
                    : "bg-background shadow-sm border border-border"
                )}
              >
                {theme.icon}
              </div>

              <h3
                className={cn(
                  "text-lg font-bold mb-1",
                  theme.id === "terminal" ? "text-green-400" : "text-foreground"
                )}
              >
                {theme.name}
              </h3>

              <p
                className={cn(
                  "text-sm leading-relaxed",
                  theme.id === "terminal"
                    ? "text-zinc-400"
                    : "text-muted-foreground"
                )}
              >
                {theme.description}
              </p>
            </button>
          );
        })}
      </div>

      {/* Preview Section */}
      <div className="bg-muted/30 border border-dashed rounded-xl p-8 text-center">
        <h2 className="text-lg font-semibold mb-2">Preview your portfolio</h2>
        <p className="text-muted-foreground mb-6">
          See how your selected theme looks with your real data.
        </p>
        <Link href={`/portfolio/${profile?.username}`} target="_blank">
          <Button>View Live Portfolio</Button>
        </Link>
      </div>
    </div>
  );
}
