"use client";

import { cn } from "@/lib/utils";

interface LogoProps {
  size?: "sm" | "md" | "lg";
  showText?: boolean;
  className?: string;
}

export function Logo({ size = "md", showText = true, className }: LogoProps) {
  const iconSizes = {
    sm: "w-6 h-6",
    md: "w-8 h-8",
    lg: "w-10 h-10",
  };

  const textSizes = {
    sm: "text-lg",
    md: "text-xl",
    lg: "text-2xl",
  };

  return (
    <div className={cn("flex items-center gap-2", className)}>
      {/* Icon */}
      <div
        className={cn(
          "relative flex items-center justify-center rounded-xl bg-gradient-to-br from-[#8B5CF6] to-[#6D28D9]",
          iconSizes[size]
        )}
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-[60%] h-[60%]"
        >
          {/* R letter with proper bowl hole */}
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M4 2H14C17.3137 2 20 4.68629 20 8C20 10.7277 18.2075 13.0211 15.7399 13.7611L20 22H16L12.1538 14H8V22H4V2ZM8 10H14C15.1046 10 16 9.10457 16 8C16 6.89543 15.1046 6 14 6H8V10Z"
            fill="white"
          />
        </svg>
      </div>

      {/* Text */}
      {showText && (
        <span
          className={cn(
            "font-bold font-heading bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent",
            textSizes[size]
          )}
        >
          RepoSpace
        </span>
      )}
    </div>
  );
}
