"use client";

import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Github, Sparkles, Zap, Globe } from "lucide-react";
import { useTranslations } from "next-intl";
import { LanguageSelector } from "@/components/language-selector";
import { Logo } from "@/components/ui/logo";

export default function LoginPage() {
  const supabase = createClient();
  const t = useTranslations();

  const handleGitHubLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "github",
      options: {
        // Only request access to public repos (not private)
        scopes: "read:user public_repo",
        redirectTo: `${window.location.origin}/callback`,
      },
    });
  };

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
            <Button
              onClick={handleGitHubLogin}
              className="w-full h-12 text-base"
              size="lg"
            >
              <Github className="mr-2 h-5 w-5" />
              {t("login.continueWithGithub")}
            </Button>
          </CardContent>
        </Card>

        {/* Features */}
        {/* <div className="grid grid-cols-3 gap-4 text-center">
          <div className="space-y-2">
            <div className="mx-auto w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Zap className="h-5 w-5 text-primary" />
            </div>
            <p className="text-sm text-muted-foreground">
              {t("login.quickSetup")}
            </p>
          </div>
          <div className="space-y-2">
            <div className="mx-auto w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Sparkles className="h-5 w-5 text-primary" />
            </div>
            <p className="text-sm text-muted-foreground">{t("login.themes")}</p>
          </div>
          <div className="space-y-2">
            <div className="mx-auto w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Globe className="h-5 w-5 text-primary" />
            </div>
            <p className="text-sm text-muted-foreground">
              {t("login.freeSubdomain")}
            </p>
          </div>
        </div> */}
      </div>
    </div>
  );
}
