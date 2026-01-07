"use client";

import { useTransition } from "react";
import { useLocale } from "next-intl";
import { Globe } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
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

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          disabled={isPending}
          className={cn(
            variant === "sidebar" && "w-full justify-start"
          )}
        >
          <Globe className="h-4 w-4 mr-2" />
          {currentLanguage && (
            <>
              {getFlagEmoji(currentLanguage.flag)} {currentLanguage.label}
            </>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align={variant === "sidebar" ? "start" : "end"}>
        {languages.map((language) => (
          <DropdownMenuItem
            key={language.code}
            onClick={() => handleLanguageChange(language.code)}
            className={cn(
              "cursor-pointer",
              locale === language.code && "bg-accent"
            )}
          >
            {getFlagEmoji(language.flag)} {language.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
