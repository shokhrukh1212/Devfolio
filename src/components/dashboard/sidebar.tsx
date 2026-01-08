"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FolderGit2,
  User,
  Palette,
  LogOut,
  ExternalLink,
  Menu,
  X,
  ChevronDown,
  Settings,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LanguageSelector } from "@/components/language-selector";
import { ThemeToggle } from "@/components/theme-toggle";
import { useTranslations } from "next-intl";
import type { User as SupabaseUser } from "@supabase/supabase-js";
import type { Profile } from "@/types";

interface DashboardSidebarProps {
  user: SupabaseUser;
  profile: Profile | null;
}

export function DashboardSidebar({ user, profile }: DashboardSidebarProps) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const supabase = createClient();
  const t = useTranslations("dashboard.sidebar");

  const navItems = [
    { href: "/dashboard", label: t("overview"), icon: LayoutDashboard },
    { href: "/dashboard/projects", label: t("projects"), icon: FolderGit2 },
    { href: "/dashboard/settings", label: t("profile"), icon: User },
    { href: "/dashboard/theme", label: t("theme"), icon: Palette },
  ];

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/login";
  };

  return (
    <>
      {/* Mobile Menu Toggle */}
      <button
        className="fixed top-4 right-4 z-50 lg:hidden p-2 bg-card border border-border rounded-md shadow-md"
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
      >
        {mobileMenuOpen ? (
          <X className="w-5 h-5" />
        ) : (
          <Menu className="w-5 h-5" />
        )}
      </button>

      {/* Overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-72 bg-card border-r border-border transform transition-transform duration-200 ease-in-out lg:translate-x-0 flex flex-col",
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Logo */}
        <div className="p-6 border-b border-border">
          <h1 className="text-xl font-bold font-heading bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
            Devfolio
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            {t("buildShowcase")}
          </p>
        </div>

        {/* User Info - Dropdown */}
        <div className="p-4 border-b border-border">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="w-full flex items-center gap-3 p-2 -m-2 rounded-lg hover:bg-muted transition-colors">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={profile?.avatar_url || undefined} />
                  <AvatarFallback>
                    {profile?.display_name?.[0] || user.email?.[0] || "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0 text-left">
                  <p className="text-sm font-medium truncate">
                    {profile?.display_name || "User"}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    @{profile?.username || "username"}
                  </p>
                </div>
                <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56">
              <DropdownMenuItem asChild>
                <Link href="/dashboard/settings" className="cursor-pointer">
                  <Settings className="h-4 w-4 mr-2" />
                  {t("manageAccount")}
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleLogout}
                className="cursor-pointer text-destructive focus:text-destructive focus:bg-destructive/10"
              >
                <LogOut className="h-4 w-4 mr-2" />
                {t("signOut")}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-4 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileMenuOpen(false)}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                pathname === item.href
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Footer Actions */}
        <div className="p-4 border-t border-border">
          {/* Language Selector - Bordered */}
          <LanguageSelector variant="sidebar" />

          {/* Theme Toggle - Gray Background */}
          <div className="mt-2">
            <ThemeToggle />
          </div>

          {/* Portfolio Button - Primary */}
          {profile?.username && (
            <a
              href={`/portfolio/${profile.username}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full h-10 mt-4 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
            >
              {t("viewPortfolio")} <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}
        </div>
      </aside>
    </>
  );
}
