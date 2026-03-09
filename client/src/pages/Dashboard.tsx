import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import LimitBadge from "@/components/LimitBadge";
import { TrendingUp, Zap, Clock, Loader2 } from "lucide-react";
import { Link, useLocation } from "wouter";
import SEO from "@/components/SEO";
import { useAuth } from "@/hooks/useAuth";
import { useEffect } from "react";

export default function Dashboard() {
  const { user, isLoading, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      setLocation("/login");
    }
  }, [isLoading, isAuthenticated, setLocation]);

  if (isLoading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const userPlan = "FREE";
  const usageToday = 3;
  const usageLimit = 5;

  const recentTools = [
    { name: "Profit Margin Calculator", time: "2 hours ago", href: "/tools/profit-margin" },
    { name: "PDF Merger", time: "5 hours ago", href: "/tools/pdf-merge" },
    { name: "Timezone Converter", time: "Yesterday", href: "/tools/timezone" },
  ];

  const quickActions = [
    { name: "Profit Margin", href: "/tools/profit-margin" },
    { name: "PDF Merge", href: "/tools/pdf-merge" },
    { name: "Image Convert", href: "/tools/image-convert" },
  ];

  return (
    <>
      <SEO
        title="Dashboard - TymFlo Hub"
        description="View your usage statistics and access your favorite tools quickly."
        canonical="https://tymflohub.com/dashboard"
      />

      <div className="py-16 bg-background min-h-[calc(100vh-4rem)]">
        <div className="container mx-auto max-w-6xl px-4">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">
              Welcome back{user.firstName ? `, ${user.firstName}` : ""}!
            </h1>
            <p className="text-muted-foreground">Here's your activity overview</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-muted-foreground">Today's Usage</h3>
                <TrendingUp className="w-4 h-4 text-muted-foreground" />
              </div>
              <div className="text-3xl font-bold mb-2" data-testid="text-usage-today">
                {usageToday}/{usageLimit}
              </div>
              <LimitBadge current={usageToday} limit={usageLimit} />
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-muted-foreground">Current Plan</h3>
                <Zap className="w-4 h-4 text-muted-foreground" />
              </div>
              <div className="text-3xl font-bold mb-2" data-testid="text-current-plan">
                {userPlan}
              </div>
              {userPlan === "FREE" && (
                <Link href="/pricing">
                  <Button variant="outline" size="sm" className="mt-2" data-testid="button-upgrade">
                    Upgrade
                  </Button>
                </Link>
              )}
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-muted-foreground">Tools Used</h3>
                <Clock className="w-4 h-4 text-muted-foreground" />
              </div>
              <div className="text-3xl font-bold" data-testid="text-tools-used">
                {recentTools.length}
              </div>
              <p className="text-xs text-muted-foreground mt-2">This week</p>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-muted-foreground">Time Saved</h3>
                <Clock className="w-4 h-4 text-muted-foreground" />
              </div>
              <div className="text-3xl font-bold" data-testid="text-time-saved">
                ~2.5h
              </div>
              <p className="text-xs text-muted-foreground mt-2">Estimated</p>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Recent Tools</h2>
              <div className="space-y-3">
                {recentTools.map((tool, index) => (
                  <Link key={index} href={tool.href}>
                    <div className="flex items-center justify-between p-3 rounded-lg hover-elevate active-elevate-2 cursor-pointer" data-testid={`item-recent-tool-${index}`}>
                      <div>
                        <div className="font-medium">{tool.name}</div>
                        <div className="text-sm text-muted-foreground">{tool.time}</div>
                      </div>
                      <Button variant="ghost" size="sm">
                        Use again
                      </Button>
                    </div>
                  </Link>
                ))}
              </div>
            </Card>

            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
              <div className="grid grid-cols-2 gap-3">
                {quickActions.map((action, index) => (
                  <Link key={index} href={action.href}>
                    <Button variant="outline" className="w-full" data-testid={`button-quick-${index}`}>
                      {action.name}
                    </Button>
                  </Link>
                ))}
              </div>

              {userPlan === "FREE" && (
                <Card className="mt-6 p-4 bg-primary/5 border-primary/20">
                  <h3 className="font-semibold mb-2">Upgrade to Pro</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Get unlimited access to all tools, no ads, and larger file sizes.
                  </p>
                  <Link href="/pricing">
                    <Button className="w-full" data-testid="button-upgrade-cta">
                      View Plans
                    </Button>
                  </Link>
                </Card>
              )}
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}
