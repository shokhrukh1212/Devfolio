import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Github, Sparkles, Zap, Globe, ArrowRight } from "lucide-react";

export default async function HomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

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
            Devfolio
          </h1>
          <Link href="/login">
            <Button variant="outline" size="sm">
              Sign In
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero */}
      <main className="max-w-6xl mx-auto px-4 py-20">
        <div className="text-center space-y-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium">
            <Sparkles className="w-4 h-4" />
            Build your portfolio in 60 seconds
          </div>

          <h2 className="text-5xl md:text-6xl font-bold tracking-tight">
            GitHub → Portfolio → Share
          </h2>

          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Transform your GitHub profile into a beautiful developer portfolio.
            No design skills required. Choose a theme, import your projects, and
            go live instantly.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/login">
              <Button size="lg" className="text-base h-12 px-8">
                <Github className="mr-2 h-5 w-5" />
                Get Started with GitHub
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
            <h3 className="text-xl font-semibold">Quick Setup</h3>
            <p className="text-muted-foreground">
              Sign in with GitHub, select your best projects, and your portfolio
              is ready in under a minute.
            </p>
          </div>

          <div className="text-center space-y-4 p-6">
            <div className="mx-auto w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
              <Sparkles className="h-7 w-7 text-primary" />
            </div>
            <h3 className="text-xl font-semibold">3 Beautiful Themes</h3>
            <p className="text-muted-foreground">
              Choose from Minimal, Bento Grid, or Terminal Dark. Each theme is
              mobile-friendly and SEO-ready.
            </p>
          </div>

          <div className="text-center space-y-4 p-6">
            <div className="mx-auto w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
              <Globe className="h-7 w-7 text-primary" />
            </div>
            <h3 className="text-xl font-semibold">Free Subdomain</h3>
            <p className="text-muted-foreground">
              Get your own portfolio at username.devfolio.uz. Custom domains
              coming soon.
            </p>
          </div>
        </div>

        {/* CTA */}
        <div className="mt-24 text-center bg-muted/30 rounded-3xl p-12 border border-dashed">
          <h3 className="text-2xl font-bold mb-4">
            Ready to build your portfolio?
          </h3>
          <p className="text-muted-foreground mb-8 max-w-md mx-auto">
            Join developers who use Devfolio to showcase their work and land
            opportunities.
          </p>
          <Link href="/login">
            <Button size="lg">
              Start Building <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border mt-20">
        <div className="max-w-6xl mx-auto px-4 py-8 text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} Devfolio. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
