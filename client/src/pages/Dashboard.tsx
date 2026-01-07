import { Layout } from "@/components/Layout";
import { useProfile } from "@/hooks/use-profile";
import { useProjects } from "@/hooks/use-projects";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { ArrowRight, Eye, FolderGit2, Star, MousePointerClick } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

export default function Dashboard() {
  const { data: profile, isLoading: profileLoading } = useProfile();
  const { data: projects, isLoading: projectsLoading } = useProjects();

  if (profileLoading || projectsLoading) {
    return (
      <Layout>
        <div className="space-y-6">
          <Skeleton className="h-32 w-full rounded-xl" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Skeleton className="h-40 rounded-xl" />
            <Skeleton className="h-40 rounded-xl" />
            <Skeleton className="h-40 rounded-xl" />
          </div>
        </div>
      </Layout>
    );
  }

  // Calculate stats
  const totalProjects = projects?.length || 0;
  const visibleProjects = projects?.filter(p => p.isVisible).length || 0;
  const totalStars = projects?.reduce((acc, curr) => acc + (curr.stars || 0), 0) || 0;
  
  // Dummy analytics data for visualization (real analytics would come from backend)
  const analyticsData = [
    { name: 'Mon', views: 12 },
    { name: 'Tue', views: 19 },
    { name: 'Wed', views: 3 },
    { name: 'Thu', views: 5 },
    { name: 'Fri', views: 22 },
    { name: 'Sat', views: 35 },
    { name: 'Sun', views: 15 },
  ];

  return (
    <Layout>
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold font-heading text-foreground">
              Welcome back, {profile?.displayName?.split(' ')[0] || 'Developer'}
            </h1>
            <p className="text-muted-foreground mt-1">
              Here's what's happening with your portfolio today.
            </p>
          </div>
          
          <Link href="/dashboard/projects">
            <Button>
              Manage Projects <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </Link>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
              <FolderGit2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalProjects}</div>
              <p className="text-xs text-muted-foreground">
                {visibleProjects} currently visible
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Stars</CardTitle>
              <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalStars}</div>
              <p className="text-xs text-muted-foreground">
                Across all repositories
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Profile Views</CardTitle>
              <Eye className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">128</div>
              <p className="text-xs text-green-500 font-medium">
                +12% from last week
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Analytics Chart */}
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Visitor Activity</CardTitle>
            <CardDescription>
              Views over the last 7 days
            </CardDescription>
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
                    cursor={{ fill: 'transparent' }}
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
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
      </div>
    </Layout>
  );
}
