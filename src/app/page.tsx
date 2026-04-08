import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  TriangleAlert,
  Sparkles,
  Zap,
  Globe,
  ArrowRight,
  Play,
} from "lucide-react";
import { getTranslations } from "next-intl/server";
import { LanguageSelector } from "@/components/language-selector";
import { Logo } from "@/components/ui/logo";

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
      <div className="border-b border-amber-500/20 bg-amber-500/10">
        <div className="max-w-6xl mx-auto px-4 py-3 flex flex-col gap-1 text-sm sm:flex-row sm:items-center sm:justify-center sm:gap-3">
          <div className="inline-flex items-center gap-2 font-medium text-amber-200">
            <TriangleAlert className="h-4 w-4" />
            <span>{t("landing.maintenance.badge")}</span>
          </div>
          <p className="text-amber-100/80">
            {t("landing.maintenance.description")}
          </p>
        </div>
      </div>

      {/* Header */}
      <header className="border-b border-border">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <Logo size="sm" />
          <div className="flex items-center gap-2">
            <LanguageSelector />
            <Button variant="outline" size="sm" disabled>
              {t("landing.maintenance.cta")}
            </Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <main className="max-w-6xl mx-auto px-4 py-20">
        <div className="text-center space-y-8">
          <div className="mx-auto max-w-3xl rounded-2xl border border-amber-500/20 bg-amber-500/10 px-6 py-5 text-left shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-amber-200">
              {t("landing.maintenance.badge")}
            </p>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight text-foreground md:text-3xl">
              {t("landing.maintenance.title")}
            </h1>
            <p className="mt-3 text-sm leading-6 text-muted-foreground md:text-base">
              {t("landing.maintenance.description")}
            </p>
          </div>

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
            <Button size="lg" className="text-base h-12 px-8" disabled>
              {t("landing.maintenance.cta")}
            </Button>
          </div>
        </div>

        {/* Video Section */}
        <div className="mt-20 space-y-8">
          <div className="text-center space-y-4">
            <h3 className="text-3xl md:text-4xl font-bold">
              {t("landing.video.title")}
            </h3>
            <p className="text-muted-foreground max-w-xl mx-auto">
              {t("landing.video.description")}
            </p>
          </div>

          {/* Video Frame */}
          <div className="relative max-w-4xl mx-auto">
            {/* Decorative gradient background */}
            <div className="absolute -inset-4 bg-gradient-to-r from-primary/20 via-purple-500/20 to-primary/20 rounded-3xl blur-2xl opacity-50 dark:opacity-30" />

            {/* Browser-like frame */}
            <div className="relative bg-background border border-border rounded-2xl shadow-2xl overflow-hidden">
              {/* Browser bar */}
              <div className="bg-muted/50 border-b border-border px-4 py-3 flex items-center gap-3">
                <div className="flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-400" />
                  <div className="w-3 h-3 rounded-full bg-yellow-400" />
                  <div className="w-3 h-3 rounded-full bg-green-400" />
                </div>
                <div className="flex-1 flex justify-center">
                  <div className="bg-background/80 rounded-lg px-4 py-1.5 text-xs text-muted-foreground border border-border/50 flex items-center gap-2">
                    <Play className="w-3 h-3" />
                    RepoSpace Demo
                  </div>
                </div>
                <div className="w-16" /> {/* Spacer for balance */}
              </div>

              {/* YouTube iframe */}
              <div className="aspect-video bg-black">
                <iframe
                  src="https://www.youtube.com/embed/2gF8orKXz2g?rel=0&modestbranding=1"
                  title="RepoSpace Demo Video"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="w-full h-full"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-8 mt-24">
          <div className="text-center space-y-4 p-6">
            <div className="mx-auto w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
              <Zap className="h-7 w-7 text-primary" />
            </div>
            <h3 className="text-xl font-semibold">
              {t("landing.features.quickSetup.title")}
            </h3>
            <p className="text-muted-foreground">
              {t("landing.features.quickSetup.description")}
            </p>
          </div>

          <div className="text-center space-y-4 p-6">
            <div className="mx-auto w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
              <Sparkles className="h-7 w-7 text-primary" />
            </div>
            <h3 className="text-xl font-semibold">
              {t("landing.features.themes.title")}
            </h3>
            <p className="text-muted-foreground">
              {t("landing.features.themes.description")}
            </p>
          </div>

          <div className="text-center space-y-4 p-6">
            <div className="mx-auto w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
              <Globe className="h-7 w-7 text-primary" />
            </div>
            <h3 className="text-xl font-semibold">
              {t("landing.features.subdomain.title")}
            </h3>
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
          <Button size="lg" disabled>
            {t("landing.maintenance.cta")}{" "}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border mt-20">
        <div className="max-w-6xl mx-auto px-4 py-8 text-center text-sm text-muted-foreground">
          <p>
            {t("landing.footer.copyright", { year: new Date().getFullYear() })}
          </p>
        </div>
      </footer>
    </div>
  );
}
