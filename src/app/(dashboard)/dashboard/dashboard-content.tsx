"use client";

import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LockedCard } from "@/components/ui/locked-card";
import { ArrowRight, Eye, FolderGit2, Star, Share2, MapPin, Link2, Copy, Check } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { toast } from "sonner";
import type { Profile, Project, AnalyticsEvent } from "@/types";

interface DashboardContentProps {
  profile: Profile | null;
  projects: Project[];
  analytics: AnalyticsEvent[];
}

export function DashboardContent({ profile, projects, analytics }: DashboardContentProps) {
  const t = useTranslations("dashboard.overview");
  const tToast = useTranslations("toast");
  const [copied, setCopied] = useState(false);

  // Calculate stats
  const totalProjects = projects.length;
  const visibleProjects = projects.filter((p) => p.is_visible).length;
  const totalStars = projects.reduce((acc, curr) => acc + (curr.stars || 0), 0);
  const totalViews = analytics.filter((a) => a.event_type === "page_view").length;

  // Group analytics by day for chart
  const analyticsData = getAnalyticsChartData(analytics);

  const portfolioUrl = `${profile?.username}.devfolio.uz`;

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(`https://${portfolioUrl}`);
      setCopied(true);
      toast.success(tToast("urlCopied"));
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error(tToast("copyFailed"));
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold font-heading text-foreground">
            {t("welcome", { name: profile?.display_name?.split(" ")[0] || "Developer" })}
          </h1>
          <p className="text-muted-foreground mt-1">
            {t("subtitle")}
          </p>
        </div>

        <Link href="/dashboard/projects">
          <Button>
            {t("manageProjects")} <ArrowRight className="ml-2 w-4 h-4" />
          </Button>
        </Link>
      </div>

      {/* Share Your Portfolio */}
      <Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
        <CardContent className="py-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Share2 className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-medium text-sm">{t("shareYourPortfolio")}</p>
                <p className="text-muted-foreground text-sm">{portfolioUrl}</p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopyUrl}
              className="gap-2"
            >
              {copied ? (
                <>
                  <Check className="h-4 w-4" />
                  {t("copied")}
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4" />
                  {t("copyLink")}
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t("totalProjects")}</CardTitle>
            <FolderGit2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalProjects}</div>
            <p className="text-xs text-muted-foreground">
              {t("currentlyVisible", { count: visibleProjects })}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t("totalStars")}</CardTitle>
            <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalStars}</div>
            <p className="text-xs text-muted-foreground">{t("acrossRepos")}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t("profileViews")}</CardTitle>
            <Eye className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalViews}</div>
            <p className="text-xs text-muted-foreground">{t("lastDays")}</p>
          </CardContent>
        </Card>
      </div>

      {/* Analytics Chart */}
      <Card>
        <CardHeader>
          <CardTitle>{t("visitorActivity")}</CardTitle>
          <CardDescription>{t("viewsOverDays")}</CardDescription>
        </CardHeader>
        <CardContent className="pl-2">
          <div className="h-[240px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analyticsData}>
                <XAxis
                  dataKey="name"
                  stroke="#888888"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="#888888"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => `${value}`}
                />
                <Tooltip
                  cursor={{ fill: "transparent" }}
                  contentStyle={{
                    borderRadius: "8px",
                    border: "none",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                  }}
                />
                <Bar
                  dataKey="views"
                  fill="hsl(var(--primary))"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={40}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Pro Features - Locked Analytics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Top Locations */}
        <LockedCard
          title={t("topLocations")}
          description={t("topLocationsDescription")}
          featureKey="analytics"
          userId={profile?.id || ""}
          initialJoined={profile?.custom_data?.waitlist_interests?.analytics || false}
          unlockButtonText={t("unlockData")}
          joinedText={t("onWaitlist")}
        >
          <div className="space-y-3">
            {["United States", "Germany", "India", "United Kingdom", "Canada"].map((country, i) => (
              <div key={country} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{country}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-20 h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary/40 rounded-full"
                      style={{ width: `${100 - i * 20}%` }}
                    />
                  </div>
                  <span className="text-xs text-muted-foreground w-8">{100 - i * 20}%</span>
                </div>
              </div>
            ))}
          </div>
        </LockedCard>

        {/* Top Sources */}
        <LockedCard
          title={t("topSources")}
          description={t("topSourcesDescription")}
          featureKey="analytics"
          userId={profile?.id || ""}
          initialJoined={profile?.custom_data?.waitlist_interests?.analytics || false}
          unlockButtonText={t("unlockData")}
          joinedText={t("onWaitlist")}
        >
          <div className="space-y-3">
            {[
              { name: "LinkedIn", icon: "🔗", percent: 45 },
              { name: "Direct", icon: "🌐", percent: 30 },
              { name: "Telegram", icon: "📨", percent: 15 },
              { name: "Other", icon: "📊", percent: 10 },
            ].map((source) => (
              <div key={source.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span>{source.icon}</span>
                  <span className="text-sm">{source.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-20 h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary/40 rounded-full"
                      style={{ width: `${source.percent}%` }}
                    />
                  </div>
                  <span className="text-xs text-muted-foreground w-8">{source.percent}%</span>
                </div>
              </div>
            ))}
          </div>
        </LockedCard>
      </div>
    </div>
  );
}

function getAnalyticsChartData(analytics: AnalyticsEvent[]) {
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const today = new Date();
  const data = [];

  for (let i = 6; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dayName = days[date.getDay()];
    const dayStart = new Date(date.setHours(0, 0, 0, 0));
    const dayEnd = new Date(date.setHours(23, 59, 59, 999));

    const views = analytics.filter((a) => {
      const eventDate = new Date(a.created_at);
      return (
        a.event_type === "page_view" &&
        eventDate >= dayStart &&
        eventDate <= dayEnd
      );
    }).length;

    data.push({ name: dayName, views });
  }

  return data;
}
