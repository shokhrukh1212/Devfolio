import { Layout } from "@/components/Layout";
import { ThemeSelector } from "@/components/ThemeSelector";
import { useProfile } from "@/hooks/use-profile";
import { Skeleton } from "@/components/ui/skeleton";

export default function Theme() {
  const { data: profile, isLoading } = useProfile();

  if (isLoading) {
    return (
      <Layout>
        <div className="space-y-6">
           <Skeleton className="h-10 w-48" />
           <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
             <Skeleton className="h-64 rounded-xl" />
             <Skeleton className="h-64 rounded-xl" />
             <Skeleton className="h-64 rounded-xl" />
           </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold font-heading">Theme Selection</h1>
          <p className="text-muted-foreground mt-1">
            Choose how your portfolio looks to the world. Changes are applied immediately.
          </p>
        </div>

        <ThemeSelector currentTheme={profile?.theme} />

        <div className="bg-muted/30 border border-dashed rounded-xl p-8 text-center mt-12">
          <h2 className="text-lg font-semibold mb-2">Preview your portfolio</h2>
          <p className="text-muted-foreground mb-6">See how your selected theme looks with your real data.</p>
          <a 
            href={`/portfolio/${profile?.username}`} 
            target="_blank"
            className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
          >
            View Live Portfolio
          </a>
        </div>
      </div>
    </Layout>
  );
}
