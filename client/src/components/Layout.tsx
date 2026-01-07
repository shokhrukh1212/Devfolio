import { useState } from "react";
import { Link, useLocation } from "wouter";
import { 
  LayoutDashboard, 
  FolderGit2, 
  User, 
  Palette, 
  LogOut, 
  ExternalLink,
  Menu,
  X
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useProfile } from "@/hooks/use-profile";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const { logout } = useAuth();
  const { data: profile } = useProfile();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
    { href: "/dashboard/projects", label: "Projects", icon: FolderGit2 },
    { href: "/dashboard/profile", label: "Profile", icon: User },
    { href: "/dashboard/theme", label: "Theme", icon: Palette },
  ];

  return (
    <div className="min-h-screen bg-background flex">
      {/* Mobile Menu Toggle */}
      <button 
        className="fixed top-4 right-4 z-50 md:hidden p-2 bg-card border border-border rounded-md shadow-md"
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
      >
        {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* Sidebar */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-40 w-64 bg-card border-r border-border transform transition-transform duration-200 ease-in-out md:translate-x-0 md:static md:block flex flex-col",
        mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="p-6">
          <h1 className="text-xl font-bold font-heading bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
            DevPortfolio
          </h1>
          <p className="text-xs text-muted-foreground mt-1">Build your showcase</p>
        </div>

        <nav className="flex-1 px-4 space-y-1">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href}>
              <div
                onClick={() => setMobileMenuOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer",
                  location === item.href
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </div>
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-border space-y-4">
          {profile?.username && (
            <a 
              href={`/portfolio/${profile.username}`} 
              target="_blank" 
              className="flex items-center justify-center gap-2 w-full px-4 py-2 bg-secondary text-secondary-foreground rounded-lg text-sm font-medium hover:bg-secondary/80 transition-colors"
            >
              View Public Site <ExternalLink className="w-3 h-3" />
            </a>
          )}
          
          <Button 
            variant="ghost" 
            className="w-full justify-start text-muted-foreground hover:text-destructive"
            onClick={() => logout()}
          >
            <LogOut className="w-4 h-4 mr-2" />
            Log out
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto bg-background p-6 md:p-8 pt-20 md:pt-8">
        <div className="max-w-5xl mx-auto animate-fade-in-up">
          {children}
        </div>
      </main>
    </div>
  );
}
