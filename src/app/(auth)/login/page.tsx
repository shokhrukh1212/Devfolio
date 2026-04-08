"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { TriangleAlert } from "lucide-react";
import { useTranslations } from "next-intl";
import { LanguageSelector } from "@/components/language-selector";
import { Logo } from "@/components/ui/logo";

export default function LoginPage() {
  const t = useTranslations();

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      {/* Language Selector */}
      <div className="absolute top-4 right-4">
        <LanguageSelector />
      </div>

      <div className="w-full max-w-md space-y-8">
        {/* Logo */}
        <div className="flex flex-col items-center">
          <Logo size="lg" />
          <p className="text-muted-foreground mt-3">{t("login.tagline")}</p>
        </div>

        {/* Login Card */}
        <Card className="border-border/50 shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">{t("login.title")}</CardTitle>
            <CardDescription>{t("login.description")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 p-4 text-left">
              <div className="flex items-start gap-3">
                <TriangleAlert className="mt-0.5 h-5 w-5 text-amber-300" />
                <div className="space-y-1">
                  <p className="font-medium text-foreground">
                    {t("login.maintenance.title")}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {t("login.maintenance.description")}
                  </p>
                </div>
              </div>
            </div>

            <Button className="w-full h-12 text-base" size="lg" disabled>
              {t("login.maintenance.cta")}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
