"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Check,
  LayoutTemplate,
  Terminal,
  Type,
  ExternalLink,
  RefreshCw,
} from "lucide-react";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import type { Profile, ThemeName } from "@/types";

interface ThemeOption {
  id: ThemeName;
  icon: React.ReactNode;
  colors: string;
}

const themeOptions: ThemeOption[] = [
  {
    id: "minimal",
    icon: <Type className="w-5 h-5" />,
    colors: "bg-background border-border",
  },
  {
    id: "bento",
    icon: <LayoutTemplate className="w-5 h-5" />,
    colors: "bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800",
  },
  {
    id: "terminal",
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
  const [iframeKey, setIframeKey] = useState(0);
  const [isIframeLoading, setIsIframeLoading] = useState(true);
  const supabase = createClient();
  const t = useTranslations("themeSelection");
  const tToast = useTranslations("toast");

  const portfolioUrl = `/portfolio/${profile?.username}`;
  const previewUrl = `${portfolioUrl}?preview=true`;

  const handleThemeChange = async (themeId: ThemeName) => {
    setIsUpdating(true);
    setIsIframeLoading(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ theme: themeId })
        .eq("id", profile?.id);

      if (error) throw error;

      setCurrentTheme(themeId);
      // Refresh iframe after a short delay to let the server update
      setTimeout(() => {
        setIframeKey((prev) => prev + 1);
      }, 300);
      toast.success(
        tToast("themeChanged", { theme: t(`themes.${themeId}.name`) })
      );
    } catch (error) {
      toast.error(tToast("themeChangeFailed"));
      console.error(error);
      setIsIframeLoading(false);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleRefreshPreview = () => {
    setIsIframeLoading(true);
    setIframeKey((prev) => prev + 1);
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold font-heading">{t("title")}</h1>
        <p className="text-muted-foreground mt-1">{t("description")}</p>
      </div>

      {/* Theme Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {themeOptions.map((theme) => {
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
                {t(`themes.${theme.id}.name`)}
              </h3>

              <p
                className={cn(
                  "text-sm leading-relaxed",
                  theme.id === "terminal"
                    ? "text-zinc-400"
                    : "text-muted-foreground"
                )}
              >
                {t(`themes.${theme.id}.description`)}
              </p>
            </button>
          );
        })}
      </div>

      {/* Live Preview Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">{t("preview.title")}</h2>
            <p className="text-sm text-muted-foreground">
              {t("preview.description")}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefreshPreview}
              disabled={isIframeLoading}
            >
              <RefreshCw
                className={cn(
                  "w-4 h-4 mr-2",
                  isIframeLoading && "animate-spin"
                )}
              />
              {t("preview.refresh")}
            </Button>
            <Link href={previewUrl} target="_blank">
              <Button size="sm">
                <ExternalLink className="w-4 h-4 mr-2" />
                {t("preview.viewLive")}
              </Button>
            </Link>
          </div>
        </div>

        {/* Browser Frame */}
        <div className="border rounded-xl overflow-hidden bg-background shadow-lg">
          {/* Browser Bar */}
          <div className="bg-muted/50 border-b px-4 py-2 flex items-center gap-2">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-red-400" />
              <div className="w-3 h-3 rounded-full bg-yellow-400" />
              <div className="w-3 h-3 rounded-full bg-green-400" />
            </div>
            <div className="flex-1 ml-4">
              <div className="bg-background rounded-md px-3 py-1 text-xs text-muted-foreground border max-w-md">
                {profile?.username}.repospace.uz
              </div>
            </div>
          </div>

          {/* Iframe Container */}
          <div className="relative aspect-[16/10] bg-muted/20">
            {isIframeLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-background/80 z-10">
                <RefreshCw className="w-6 h-6 animate-spin text-muted-foreground" />
              </div>
            )}
            <iframe
              key={iframeKey}
              src={previewUrl}
              className="w-full h-full border-0"
              onLoad={() => setIsIframeLoading(false)}
              title="Portfolio Preview"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
