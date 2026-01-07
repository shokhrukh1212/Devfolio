import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Github, Sparkles, Zap, Globe, ArrowRight } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { LanguageSelector } from "@/components/language-selector";

export default async function HomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const t = await getTranslations();

  // If logged in, redirect to dashboard
  if (user) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
            {t("common.devfolio")}
          </h1>
          <div className="flex items-center gap-2">
            <LanguageSelector />
            <Link href="/login">
              <Button variant="outline" size="sm">
                {t("common.signIn")}
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <main className="max-w-6xl mx-auto px-4 py-20">
        <div className="text-center space-y-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium">
            <Sparkles className="w-4 h-4" />
            {t("landing.hero.badge")}
          </div>

          <h2 className="text-5xl md:text-6xl font-bold tracking-tight">
            {t("landing.hero.title")}
          </h2>

          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            {t("landing.hero.description")}
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/login">
              <Button size="lg" className="text-base h-12 px-8">
                <Github className="mr-2 h-5 w-5" />
                {t("landing.cta.getStarted")}
              </Button>
            </Link>
          </div>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-8 mt-24">
          <div className="text-center space-y-4 p-6">
            <div className="mx-auto w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
              <Zap className="h-7 w-7 text-primary" />
            </div>
            <h3 className="text-xl font-semibold">{t("landing.features.quickSetup.title")}</h3>
            <p className="text-muted-foreground">
              {t("landing.features.quickSetup.description")}
            </p>
          </div>

          <div className="text-center space-y-4 p-6">
            <div className="mx-auto w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
              <Sparkles className="h-7 w-7 text-primary" />
            </div>
            <h3 className="text-xl font-semibold">{t("landing.features.themes.title")}</h3>
            <p className="text-muted-foreground">
              {t("landing.features.themes.description")}
            </p>
          </div>

          <div className="text-center space-y-4 p-6">
            <div className="mx-auto w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
              <Globe className="h-7 w-7 text-primary" />
            </div>
            <h3 className="text-xl font-semibold">{t("landing.features.subdomain.title")}</h3>
            <p className="text-muted-foreground">
              {t("landing.features.subdomain.description")}
            </p>
          </div>
        </div>

        {/* CTA */}
        <div className="mt-24 text-center bg-muted/30 rounded-3xl p-12 border border-dashed">
          <h3 className="text-2xl font-bold mb-4">
            {t("landing.ctaSection.title")}
          </h3>
          <p className="text-muted-foreground mb-8 max-w-md mx-auto">
            {t("landing.ctaSection.description")}
          </p>
          <Link href="/login">
            <Button size="lg">
              {t("landing.cta.startBuilding")} <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border mt-20">
        <div className="max-w-6xl mx-auto px-4 py-8 text-center text-sm text-muted-foreground">
          <p>{t("landing.footer.copyright", { year: new Date().getFullYear() })}</p>
        </div>
      </footer>
    </div>
  );
}
