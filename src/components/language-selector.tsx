"use client";

import { useTransition } from "react";
import { useLocale } from "next-intl";
import { ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { setLocaleCookie } from "@/lib/actions/locale";
import { cn } from "@/lib/utils";

const languages = [
  { code: "en", label: "English", flag: "GB" },
  { code: "uz", label: "O'zbekcha", flag: "UZ" },
  { code: "ru", label: "Русский", flag: "RU" },
] as const;

interface LanguageSelectorProps {
  variant?: "default" | "sidebar";
}

export function LanguageSelector({ variant = "default" }: LanguageSelectorProps) {
  const locale = useLocale();
  const [isPending, startTransition] = useTransition();

  const handleLanguageChange = (newLocale: string) => {
    startTransition(async () => {
      await setLocaleCookie(newLocale);
    });
  };

  const currentLanguage = languages.find((l) => l.code === locale);

  const getFlagEmoji = (countryCode: string) => {
    const codePoints = countryCode
      .toUpperCase()
      .split("")
      .map((char) => 127397 + char.charCodeAt(0));
    return String.fromCodePoint(...codePoints);
  };

  if (variant === "sidebar") {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            disabled={isPending}
            className={cn(
              "w-full h-10 px-3 flex items-center justify-between",
              "bg-background border border-border rounded-lg",
              "text-sm font-medium transition-colors",
              "hover:bg-accent hover:border-accent",
              "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
              "disabled:opacity-50 disabled:pointer-events-none"
            )}
          >
            <span className="flex items-center gap-2">
              {currentLanguage && (
                <>
                  <span className="text-base">{getFlagEmoji(currentLanguage.flag)}</span>
                  <span>{currentLanguage.label}</span>
                </>
              )}
            </span>
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-[var(--radix-dropdown-menu-trigger-width)]">
          {languages.map((language) => (
            <DropdownMenuItem
              key={language.code}
              onClick={() => handleLanguageChange(language.code)}
              className={cn(
                "cursor-pointer gap-2",
                locale === language.code && "bg-accent"
              )}
            >
              <span className="text-base">{getFlagEmoji(language.flag)}</span>
              <span>{language.label}</span>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          disabled={isPending}
          className={cn(
            "h-9 px-3 flex items-center gap-2",
            "bg-background border border-border rounded-lg",
            "text-sm font-medium transition-colors",
            "hover:bg-accent hover:border-accent",
            "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
            "disabled:opacity-50 disabled:pointer-events-none"
          )}
        >
          {currentLanguage && (
            <>
              <span className="text-base">{getFlagEmoji(currentLanguage.flag)}</span>
              <span>{currentLanguage.label}</span>
            </>
          )}
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {languages.map((language) => (
          <DropdownMenuItem
            key={language.code}
            onClick={() => handleLanguageChange(language.code)}
            className={cn(
              "cursor-pointer gap-2",
              locale === language.code && "bg-accent"
            )}
          >
            <span className="text-base">{getFlagEmoji(language.flag)}</span>
            <span>{language.label}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
