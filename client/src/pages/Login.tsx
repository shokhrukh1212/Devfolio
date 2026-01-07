import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Github, Code2, LayoutTemplate } from "lucide-react";

export default function Login() {
  const handleLogin = () => {
    window.location.href = "/api/login";
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/10 via-background to-background -z-10" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl -z-10" />

      <div className="mb-8 text-center space-y-2">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 text-primary mb-4 shadow-lg shadow-primary/10">
           <Code2 className="w-8 h-8" />
        </div>
        <h1 className="text-4xl font-bold font-heading tracking-tight">DevPortfolio</h1>
        <p className="text-muted-foreground text-lg max-w-md mx-auto">
          Build a stunning developer portfolio from your GitHub repositories in seconds.
        </p>
      </div>

      <Card className="w-full max-w-md border-primary/10 shadow-xl shadow-primary/5">
        <CardHeader className="text-center pb-8">
          <CardTitle className="text-xl">Welcome back</CardTitle>
          <CardDescription>
            Sign in to manage your portfolio and themes.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button 
            size="lg" 
            className="w-full font-semibold h-12 text-base shadow-lg shadow-primary/20" 
            onClick={handleLogin}
          >
            <Github className="mr-2 h-5 w-5" />
            Continue with GitHub
          </Button>
          
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">Features</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
             <div className="flex items-center gap-2">
               <LayoutTemplate className="w-4 h-4 text-primary" />
               <span>3 Premium Themes</span>
             </div>
             <div className="flex items-center gap-2">
               <Github className="w-4 h-4 text-primary" />
               <span>Auto-Sync</span>
             </div>
          </div>
        </CardContent>
      </Card>

      <footer className="mt-12 text-sm text-muted-foreground">
         &copy; {new Date().getFullYear()} DevPortfolio. All rights reserved.
      </footer>
    </div>
  );
}
