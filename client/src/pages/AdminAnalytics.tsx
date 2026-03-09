import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { BarChart3, Users, Eye, TrendingUp, Lock, LogOut } from "lucide-react";
import SEO from "@/components/SEO";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";

interface AnalyticsData {
  totalViews: number;
  uniqueVisitors: number;
  topPages: { path: string; views: number }[];
  dailyViews: { date: string; views: number }[];
}

const TOOL_NAMES: Record<string, string> = {
  "/": "Home",
  "/pricing": "Pricing",
  "/dashboard": "Dashboard",
  "/tools/profit-margin": "Profit Margin Calculator",
  "/tools/markup": "Markup Calculator",
  "/tools/breakeven": "Break-even Calculator",
  "/tools/roi": "ROI Calculator",
  "/tools/loan-calculator": "Loan Calculator",
  "/tools/mortgage-calculator": "Mortgage Calculator",
  "/tools/investment-calculator": "Investment Calculator",
  "/tools/compound-interest": "Compound Interest Calculator",
  "/tools/pdf-merge": "PDF Merge",
  "/tools/pdf-split": "PDF Split",
  "/tools/pdf-compress": "PDF Compress",
  "/tools/pdf-rotate": "PDF Rotate",
  "/tools/pdf-delete-pages": "PDF Delete Pages",
  "/tools/pdf-extract": "PDF Extract",
  "/tools/pdf-to-word": "PDF to Word",
  "/tools/pdf-to-excel": "PDF to Excel",
  "/tools/pdf-to-jpg": "PDF to JPG",
  "/tools/pdf-sign": "E-Signature",
  "/tools/word-to-pdf": "Word to PDF",
  "/tools/excel-to-pdf": "Excel to PDF",
  "/tools/jpg-to-pdf": "JPG to PDF",
  "/tools/image-convert": "Image Convert",
  "/tools/mean-median-mode": "Mean/Median/Mode",
  "/tools/standard-deviation": "Standard Deviation",
  "/tools/percentage": "Percentage Calculator",
  "/tools/ratio": "Ratio Calculator",
  "/tools/currency-converter": "Currency Converter",
  "/tools/unit-converter": "Unit Converter",
  "/tools/timezone": "Timezone Converter",
  "/tools/pomodoro": "Pomodoro Timer",
  "/tools/text-case": "Text Case Converter",
  "/tools/word-counter": "Word Counter",
  "/tools/text-formatter": "Text Formatter",
  "/tools/color-picker": "Color Picker",
  "/tools/palette-generator": "Palette Generator",
  "/tools/qr-code": "QR Code Generator",
  "/tools/wifi-qr": "WiFi QR Code",
  "/tools/vcard-qr": "vCard QR Code",
  "/tools/business-qr": "Business Page QR",
  "/tools/menu-qr": "Menu QR Code",
  "/tools/app-qr": "App Link QR",
};

export default function AdminAnalytics() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [needsSetup, setNeedsSetup] = useState(false);
  const [loading, setLoading] = useState(true);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [days, setDays] = useState(30);
  const { toast } = useToast();

  useEffect(() => {
    checkAuthStatus();
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      fetchAnalytics();
    }
  }, [isAuthenticated, days]);

  const checkAuthStatus = async () => {
    const token = localStorage.getItem("admin_token");
    
    if (token) {
      try {
        const res = await fetch(`/api/admin/analytics?days=${days}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          setIsAuthenticated(true);
          const data = await res.json();
          setAnalytics(data);
          setLoading(false);
          return;
        }
      } catch (e) {
        localStorage.removeItem("admin_token");
      }
    }

    try {
      const statusRes = await fetch("/api/admin/status");
      const status = await statusRes.json();
      setNeedsSetup(status.needsSetup);
    } catch (e) {
      console.error("Failed to check admin status");
    }
    
    setLoading(false);
  };

  const handleSetup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      toast({
        title: "Passwords don't match",
        description: "Please make sure both passwords are the same.",
        variant: "destructive",
      });
      return;
    }

    if (password.length < 6) {
      toast({
        title: "Password too short",
        description: "Password must be at least 6 characters.",
        variant: "destructive",
      });
      return;
    }

    try {
      const res = await fetch("/api/admin/setup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      if (res.ok) {
        const data = await res.json();
        localStorage.setItem("admin_token", data.token);
        setIsAuthenticated(true);
        setNeedsSetup(false);
        toast({
          title: "Admin password set!",
          description: "You can now access the analytics dashboard.",
        });
      } else {
        const error = await res.json();
        toast({
          title: "Setup failed",
          description: error.error,
          variant: "destructive",
        });
      }
    } catch (e) {
      toast({
        title: "Error",
        description: "Failed to set up admin password.",
        variant: "destructive",
      });
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      if (res.ok) {
        const data = await res.json();
        localStorage.setItem("admin_token", data.token);
        setIsAuthenticated(true);
        toast({
          title: "Logged in!",
          description: "Welcome to your analytics dashboard.",
        });
      } else {
        const error = await res.json();
        toast({
          title: "Login failed",
          description: error.error,
          variant: "destructive",
        });
      }
    } catch (e) {
      toast({
        title: "Error",
        description: "Failed to log in.",
        variant: "destructive",
      });
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("admin_token");
    setIsAuthenticated(false);
    setPassword("");
    toast({
      title: "Logged out",
      description: "You have been logged out.",
    });
  };

  const fetchAnalytics = async () => {
    const token = localStorage.getItem("admin_token");
    if (!token) return;

    try {
      const res = await fetch(`/api/admin/analytics?days=${days}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        const data = await res.json();
        setAnalytics(data);
      } else if (res.status === 401) {
        handleLogout();
      }
    } catch (e) {
      console.error("Failed to fetch analytics");
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  const getToolName = (path: string) => {
    return TOOL_NAMES[path] || path;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <>
        <SEO
          title="Admin Analytics - TymFlo Hub"
          description="Admin analytics dashboard"
        />
        <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                <Lock className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>
                {needsSetup ? "Set Up Admin Access" : "Admin Login"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={needsSetup ? handleSetup : handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={needsSetup ? "Create a password" : "Enter your password"}
                    data-testid="input-admin-password"
                  />
                </div>
                
                {needsSetup && (
                  <div className="space-y-2">
                    <Label htmlFor="confirm-password">Confirm Password</Label>
                    <Input
                      id="confirm-password"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm your password"
                      data-testid="input-confirm-password"
                    />
                  </div>
                )}

                <Button type="submit" className="w-full" data-testid="button-admin-submit">
                  {needsSetup ? "Set Password & Continue" : "Login"}
                </Button>

                {needsSetup && (
                  <p className="text-xs text-muted-foreground text-center">
                    This password will protect your analytics dashboard. Remember it!
                  </p>
                )}
              </form>
            </CardContent>
          </Card>
        </div>
      </>
    );
  }

  return (
    <>
      <SEO
        title="Admin Analytics - TymFlo Hub"
        description="View your website analytics and tool usage statistics"
      />
      <div className="min-h-screen bg-muted/30">
        <div className="container mx-auto py-8 px-4">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
              <p className="text-muted-foreground">Track your website traffic and tool usage</p>
            </div>
            <div className="flex items-center gap-2">
              <select
                value={days}
                onChange={(e) => setDays(Number(e.target.value))}
                className="border rounded-md px-3 py-2 bg-background"
                data-testid="select-time-range"
              >
                <option value={7}>Last 7 days</option>
                <option value={30}>Last 30 days</option>
                <option value={90}>Last 90 days</option>
                <option value={365}>Last year</option>
              </select>
              <Button variant="outline" size="icon" onClick={handleLogout} data-testid="button-logout">
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Page Views</CardTitle>
                <Eye className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold" data-testid="text-total-views">
                  {analytics?.totalViews.toLocaleString() || 0}
                </div>
                <p className="text-xs text-muted-foreground">Last {days} days</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Unique Visitors</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold" data-testid="text-unique-visitors">
                  {analytics?.uniqueVisitors.toLocaleString() || 0}
                </div>
                <p className="text-xs text-muted-foreground">Last {days} days</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Top Tool</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-lg font-bold truncate" data-testid="text-top-tool">
                  {analytics?.topPages[0] ? getToolName(analytics.topPages[0].path) : "N/A"}
                </div>
                <p className="text-xs text-muted-foreground">
                  {analytics?.topPages[0]?.views.toLocaleString() || 0} views
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg Daily Views</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold" data-testid="text-avg-daily">
                  {analytics?.dailyViews.length
                    ? Math.round(analytics.totalViews / analytics.dailyViews.length).toLocaleString()
                    : 0}
                </div>
                <p className="text-xs text-muted-foreground">Last {days} days</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Daily Traffic</CardTitle>
              </CardHeader>
              <CardContent>
                {analytics?.dailyViews.length ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={analytics.dailyViews}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis
                        dataKey="date"
                        tickFormatter={formatDate}
                        className="text-xs"
                        stroke="currentColor"
                      />
                      <YAxis className="text-xs" stroke="currentColor" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--background))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "6px",
                        }}
                        labelFormatter={formatDate}
                      />
                      <Line
                        type="monotone"
                        dataKey="views"
                        stroke="hsl(var(--primary))"
                        strokeWidth={2}
                        dot={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                    No data yet. Views will appear here as visitors use your site.
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Top Pages & Tools</CardTitle>
              </CardHeader>
              <CardContent>
                {analytics?.topPages.length ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart
                      data={analytics.topPages.slice(0, 10)}
                      layout="vertical"
                      margin={{ left: 100 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis type="number" className="text-xs" stroke="currentColor" />
                      <YAxis
                        type="category"
                        dataKey="path"
                        tickFormatter={getToolName}
                        className="text-xs"
                        stroke="currentColor"
                        width={100}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--background))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "6px",
                        }}
                        labelFormatter={getToolName}
                      />
                      <Bar dataKey="views" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                    No data yet. Top pages will appear here as visitors use your site.
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle>All Pages ({analytics?.topPages.length || 0})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-medium">Page/Tool</th>
                      <th className="text-right py-3 px-4 font-medium">Views</th>
                      <th className="text-right py-3 px-4 font-medium">% of Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {analytics?.topPages.map((page, index) => (
                      <tr key={page.path} className="border-b last:border-0">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <span className="text-muted-foreground text-sm w-6">{index + 1}.</span>
                            <span>{getToolName(page.path)}</span>
                          </div>
                        </td>
                        <td className="text-right py-3 px-4 font-mono">
                          {page.views.toLocaleString()}
                        </td>
                        <td className="text-right py-3 px-4 text-muted-foreground">
                          {analytics.totalViews
                            ? ((page.views / analytics.totalViews) * 100).toFixed(1)
                            : 0}
                          %
                        </td>
                      </tr>
                    ))}
                    {(!analytics?.topPages.length) && (
                      <tr>
                        <td colSpan={3} className="py-8 text-center text-muted-foreground">
                          No page views recorded yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
