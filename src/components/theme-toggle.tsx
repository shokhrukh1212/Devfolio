"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export function ThemeToggle() {
  const { setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="relative w-full h-10 bg-muted rounded-lg p-1">
        <div className="grid grid-cols-2 gap-1 h-full">
          <div className="flex items-center justify-center gap-2 rounded-md text-sm font-medium">
            <Sun className="h-4 w-4" />
            <span>Light</span>
          </div>
          <div className="flex items-center justify-center gap-2 rounded-md text-sm font-medium text-muted-foreground">
            <Moon className="h-4 w-4" />
            <span>Dark</span>
          </div>
        </div>
      </div>
    );
  }

  const isLight = resolvedTheme === "light";

  return (
    <div className="relative w-full h-10 bg-muted rounded-lg p-1">
      {/* Sliding Background Pill */}
      <div
        className={cn(
          "absolute top-1 bottom-1 w-[calc(50%-4px)] bg-background rounded-md shadow-sm transition-all duration-200 ease-out",
          isLight ? "left-1" : "left-[calc(50%+2px)]"
        )}
      />

      {/* Options */}
      <div className="relative grid grid-cols-2 gap-1 h-full">
        <button
          onClick={() => setTheme("light")}
          className={cn(
            "flex items-center justify-center gap-2 rounded-md text-sm font-medium transition-colors z-10",
            isLight ? "text-foreground" : "text-muted-foreground hover:text-foreground"
          )}
        >
          <Sun className="h-4 w-4" />
          <span>Light</span>
        </button>

        <button
          onClick={() => setTheme("dark")}
          className={cn(
            "flex items-center justify-center gap-2 rounded-md text-sm font-medium transition-colors z-10",
            !isLight ? "text-foreground" : "text-muted-foreground hover:text-foreground"
          )}
        >
          <Moon className="h-4 w-4" />
          <span>Dark</span>
        </button>
      </div>
    </div>
  );
}
