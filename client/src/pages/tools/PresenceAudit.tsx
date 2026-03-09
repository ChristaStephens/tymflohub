import { useState } from "react";
import { Globe, Search, CheckCircle, AlertTriangle, XCircle, Share2, TrendingUp, Shield, Smartphone, Zap, Eye, Users, ExternalLink, Loader2, BarChart3, FileText, Link2, Image, Clock, Code, Lock, Languages, FileCode, Download } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import SEO from "@/components/SEO";
import { HowItWorks, Features, FAQSection } from "@/components/SEOContent";

interface Check {
  name: string;
  status: "pass" | "warning" | "fail";
  message: string;
  recommendation?: string;
  category: string;
  priority: "high" | "medium" | "low";
}

interface SocialProfile {
  platform: string;
  url?: string;
  found: boolean;
}

interface AuditResult {
  url: string;
  timestamp: string;
  overallScore: number;
  grades: {
    seo: { score: number; grade: string };
    performance: { score: number; grade: string };
    security: { score: number; grade: string };
    usability: { score: number; grade: string };
    social: { score: number; grade: string };
  };
  checks: Check[];
  socialProfiles: SocialProfile[];
  recommendations: string[];
  metadata: {
    title?: string;
    description?: string;
    keywords?: string;
    favicon?: string;
    ogImage?: string;
    twitterCard?: string;
  };
  performance: {
    pageSize: number;
    responseTime: number;
    scriptCount: number;
    stylesheetCount: number;
    imageCount: number;
  };
  links: {
    internal: number;
    external: number;
    nofollow: number;
  };
  headings: {
    h1: number;
    h2: number;
    h3: number;
    h4: number;
    h5: number;
    h6: number;
  };
  securityHeaders: {
    hsts: boolean;
    csp: boolean;
    xFrameOptions: boolean;
    xContentTypeOptions: boolean;
    xXssProtection: boolean;
    referrerPolicy: boolean;
  };
}

function getGradeColor(grade: string) {
  switch (grade) {
    case "A+": case "A": return "text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-400";
    case "A-": case "B+": return "text-emerald-600 bg-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-400";
    case "B": case "B-": return "text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30 dark:text-yellow-400";
    case "C+": case "C": return "text-orange-600 bg-orange-100 dark:bg-orange-900/30 dark:text-orange-400";
    case "C-": case "D+": return "text-red-500 bg-red-100 dark:bg-red-900/30 dark:text-red-400";
    default: return "text-red-600 bg-red-100 dark:bg-red-900/30 dark:text-red-400";
  }
}

function getScoreColor(score: number) {
  if (score >= 80) return "text-green-600";
  if (score >= 60) return "text-yellow-600";
  return "text-red-600";
}

function StatusIcon({ status }: { status: "pass" | "warning" | "fail" }) {
  switch (status) {
    case "pass": return <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />;
    case "warning": return <AlertTriangle className="w-5 h-5 text-yellow-500 flex-shrink-0" />;
    case "fail": return <XCircle className="w-5 h-5 text-red-500 flex-shrink-0" />;
  }
}

function PriorityBadge({ priority }: { priority: "high" | "medium" | "low" }) {
  const colors = {
    high: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
    medium: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
    low: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
  };
  return <Badge className={`text-xs ${colors[priority]}`}>{priority}</Badge>;
}

export default function PresenceAudit() {
  const [url, setUrl] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AuditResult | null>(null);
  const [socialStats, setSocialStats] = useState<Record<string, { followers: string }>>({});
  const { toast } = useToast();

  const normalizeUrl = (input: string): string => {
    let normalized = input.trim().toLowerCase();
    if (!normalized.startsWith("http://") && !normalized.startsWith("https://")) {
      normalized = "https://" + normalized;
    }
    return normalized;
  };

  const runAudit = async () => {
    if (!url.trim()) {
      toast({ title: "URL Required", description: "Please enter a website URL to analyze.", variant: "destructive" });
      return;
    }

    const normalizedUrl = normalizeUrl(url);
    setIsAnalyzing(true);
    setResult(null);

    try {
      const response = await fetch("/api/audit/website", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: normalizedUrl }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to analyze website");
      }

      const data = await response.json();
      setResult(data);
      toast({ title: "Audit Complete!", description: `Overall score: ${data.overallScore}/100` });
    } catch (error: any) {
      toast({ 
        title: "Analysis Failed", 
        description: error.message || "Could not analyze the website. Please check the URL and try again.", 
        variant: "destructive" 
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getChecksByCategory = (category: string) => {
    return result?.checks.filter(c => c.category === category) || [];
  };

  const getIssuesSummary = () => {
    if (!result) return { pass: 0, warning: 0, fail: 0 };
    return {
      pass: result.checks.filter(c => c.status === "pass").length,
      warning: result.checks.filter(c => c.status === "warning").length,
      fail: result.checks.filter(c => c.status === "fail").length,
    };
  };

  const exportReport = () => {
    if (!result) return;
    const report = {
      ...result,
      exportedAt: new Date().toISOString(),
      generatedBy: "TymFlo Hub Presence Audit",
    };
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `presence-audit-${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: "Report Exported", description: "Audit report downloaded as JSON" });
  };

  const howItWorksSteps = [
    { step: 1, title: "Enter URL", description: "Paste your website or business URL to analyze." },
    { step: 2, title: "Run Analysis", description: "We scan 40+ checks across SEO, security, performance & social." },
    { step: 3, title: "Get Recommendations", description: "Receive prioritized tips to improve your online presence." },
  ];

  const features = [
    { icon: <Search className="w-6 h-6" />, title: "SEO Analysis", description: "Check title, meta, headings, structured data, robots.txt, sitemap." },
    { icon: <Zap className="w-6 h-6" />, title: "Performance Metrics", description: "Page size, response time, resource counts." },
    { icon: <Shield className="w-6 h-6" />, title: "Security Headers", description: "HTTPS, HSTS, CSP, X-Frame-Options, mixed content." },
    { icon: <Smartphone className="w-6 h-6" />, title: "Usability Check", description: "Mobile viewport, language, charset, accessibility." },
    { icon: <Share2 className="w-6 h-6" />, title: "Social Presence", description: "Open Graph, Twitter Cards, social profile links." },
    { icon: <TrendingUp className="w-6 h-6" />, title: "Priority Actions", description: "Get ranked recommendations by importance." },
  ];

  const faqItems = [
    { question: "What does Presence Audit analyze?", answer: "We perform 40+ checks including SEO (title, meta, headings, structured data, robots.txt, sitemap), security (HTTPS, headers), performance (page size, response time), usability (mobile, accessibility), and social media (Open Graph, Twitter Cards, profile links)." },
    { question: "Is this tool free?", answer: "Yes! Presence Audit is completely free with no limits. Run as many audits as you need." },
    { question: "How is the score calculated?", answer: "Each check is weighted by priority (high, medium, low). Category scores are weighted: SEO 30%, Performance 20%, Security 20%, Usability 15%, Social 15%." },
    { question: "What's a good overall score?", answer: "90+ is excellent (A grade), 80-89 is good (B+ grade), 70-79 is average (B grade), 60-69 needs improvement (C grade), below 60 requires attention (D/F grade)." },
    { question: "Can I export the results?", answer: "Yes! Click the Export button to download the full audit report as a JSON file." },
  ];

  const issues = getIssuesSummary();

  return (
    <div className="min-h-screen bg-background">
      <SEO 
        title="Presence Audit - Website & Social Media Analyzer | TymFlo Hub"
        description="Free comprehensive website audit tool. Analyze 40+ SEO, performance, security, and social media checks. Get prioritized recommendations to improve your online presence."
        keywords="website audit, SEO analyzer, social media audit, site checker, online presence, website score, SEO tool"
        canonical="https://hub.tymflo.com/tools/presence-audit"
      />

      <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-primary/70 text-white mb-4">
            <Globe className="w-8 h-8" />
          </div>
          <h1 className="text-4xl font-bold text-foreground">Presence Audit</h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Comprehensive website analysis with 40+ checks for SEO, performance, security, and social presence. 
            Get prioritized recommendations to boost your online visibility.
          </p>
        </div>

        <Card className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Label htmlFor="url-input" className="sr-only">Website URL</Label>
              <Input
                id="url-input"
                type="text"
                placeholder="Enter website URL (e.g., example.com)"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && runAudit()}
                className="h-12 text-lg"
                data-testid="input-url"
              />
            </div>
            <Button 
              onClick={runAudit} 
              disabled={isAnalyzing}
              className="h-12 px-8 bg-primary hover:bg-primary/90"
              data-testid="button-analyze"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Search className="w-5 h-5 mr-2" />
                  Analyze
                </>
              )}
            </Button>
          </div>
        </Card>

        {isAnalyzing && (
          <Card className="p-8">
            <div className="text-center space-y-4">
              <Loader2 className="w-12 h-12 mx-auto animate-spin text-primary" />
              <h3 className="text-xl font-semibold">Analyzing Website...</h3>
              <p className="text-muted-foreground">Running 40+ checks on SEO, performance, security, and social presence.</p>
              <Progress value={45} className="max-w-md mx-auto" />
            </div>
          </Card>
        )}

        {result && (
          <div className="space-y-6">
            <Card className="p-6">
              <div className="flex flex-col lg:flex-row gap-6 items-start">
                <div className="flex items-center gap-6">
                  <div className="relative w-28 h-28">
                    <svg className="w-28 h-28 transform -rotate-90">
                      <circle cx="56" cy="56" r="48" stroke="currentColor" strokeWidth="10" fill="none" className="text-muted" />
                      <circle 
                        cx="56" cy="56" r="48" 
                        stroke="currentColor" 
                        strokeWidth="10" 
                        fill="none" 
                        strokeDasharray={`${(result.overallScore / 100) * 301.6} 301.6`}
                        className={`transition-all duration-1000 ${result.overallScore >= 80 ? "text-green-500" : result.overallScore >= 60 ? "text-yellow-500" : "text-red-500"}`}
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className={`text-2xl font-bold ${getScoreColor(result.overallScore)}`}>{result.overallScore}</span>
                      <span className="text-xs text-muted-foreground">/100</span>
                    </div>
                  </div>
                  
                  <div>
                    <h2 className="text-xl font-bold mb-1">Overall Score</h2>
                    <p className="text-sm text-muted-foreground mb-2 max-w-xs truncate">{result.url}</p>
                    <div className="flex items-center gap-3">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-bold ${getGradeColor(result.grades.seo.grade)}`}>
                        Grade: {result.grades.seo.grade}
                      </span>
                      <Button variant="outline" size="sm" onClick={exportReport} data-testid="button-export">
                        <Download className="w-4 h-4 mr-1" />
                        Export
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="flex-1 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                  {Object.entries(result.grades).map(([key, { score, grade }]) => (
                    <div key={key} className="text-center p-3 rounded-lg bg-muted/30">
                      <div className={`w-10 h-10 mx-auto rounded-full flex items-center justify-center text-sm font-bold ${getGradeColor(grade)}`}>
                        {grade}
                      </div>
                      <p className="text-xs mt-1 capitalize text-muted-foreground">{key}</p>
                      <p className={`text-sm font-medium ${getScoreColor(score)}`}>{score}%</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-6 pt-6 border-t grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="flex items-center justify-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span className="text-2xl font-bold text-green-600">{issues.pass}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">Passed</p>
                </div>
                <div>
                  <div className="flex items-center justify-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-yellow-500" />
                    <span className="text-2xl font-bold text-yellow-600">{issues.warning}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">Warnings</p>
                </div>
                <div>
                  <div className="flex items-center justify-center gap-2">
                    <XCircle className="w-5 h-5 text-red-500" />
                    <span className="text-2xl font-bold text-red-600">{issues.fail}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">Failed</p>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-primary" />
                Top Priority Actions
              </h3>
              <div className="space-y-3">
                {result.recommendations.slice(0, 5).map((rec, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-muted/30">
                    <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium flex-shrink-0">
                      {i + 1}
                    </div>
                    <p className="text-sm">{rec}</p>
                  </div>
                ))}
              </div>
            </Card>

            <Tabs defaultValue="seo" className="w-full">
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="seo" data-testid="tab-seo">
                  <FileText className="w-4 h-4 mr-2 hidden sm:inline" />
                  SEO
                </TabsTrigger>
                <TabsTrigger value="performance" data-testid="tab-performance">
                  <Zap className="w-4 h-4 mr-2 hidden sm:inline" />
                  Speed
                </TabsTrigger>
                <TabsTrigger value="security" data-testid="tab-security">
                  <Shield className="w-4 h-4 mr-2 hidden sm:inline" />
                  Security
                </TabsTrigger>
                <TabsTrigger value="usability" data-testid="tab-usability">
                  <Smartphone className="w-4 h-4 mr-2 hidden sm:inline" />
                  Usability
                </TabsTrigger>
                <TabsTrigger value="social" data-testid="tab-social">
                  <Share2 className="w-4 h-4 mr-2 hidden sm:inline" />
                  Social
                </TabsTrigger>
              </TabsList>

              <TabsContent value="seo" className="mt-6 space-y-4">
                <Card className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-semibold flex items-center gap-2">
                      <FileText className="w-5 h-5" />
                      SEO Analysis
                    </h3>
                    <Badge className={getGradeColor(result.grades.seo.grade)}>
                      {result.grades.seo.score}% - {result.grades.seo.grade}
                    </Badge>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4 mb-6">
                    <div className="p-4 rounded-lg bg-muted/30">
                      <h4 className="font-medium mb-2 flex items-center gap-2">
                        <Link2 className="w-4 h-4" />
                        Link Analysis
                      </h4>
                      <div className="grid grid-cols-3 gap-2 text-center">
                        <div>
                          <div className="text-lg font-bold text-primary">{result.links.internal}</div>
                          <div className="text-xs text-muted-foreground">Internal</div>
                        </div>
                        <div>
                          <div className="text-lg font-bold text-blue-500">{result.links.external}</div>
                          <div className="text-xs text-muted-foreground">External</div>
                        </div>
                        <div>
                          <div className="text-lg font-bold text-gray-500">{result.links.nofollow}</div>
                          <div className="text-xs text-muted-foreground">Nofollow</div>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 rounded-lg bg-muted/30">
                      <h4 className="font-medium mb-2 flex items-center gap-2">
                        <FileCode className="w-4 h-4" />
                        Heading Structure
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {Object.entries(result.headings).map(([tag, count]) => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            {tag.toUpperCase()}: {count}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {getChecksByCategory("seo").map((check, i) => (
                      <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-muted/20 hover:bg-muted/40 transition-colors">
                        <StatusIcon status={check.status} />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="font-medium">{check.name}</h4>
                            <PriorityBadge priority={check.priority} />
                          </div>
                          <p className="text-sm text-muted-foreground">{check.message}</p>
                          {check.recommendation && (
                            <p className="text-sm text-primary mt-1">{check.recommendation}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              </TabsContent>

              <TabsContent value="performance" className="mt-6 space-y-4">
                <Card className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-semibold flex items-center gap-2">
                      <Zap className="w-5 h-5" />
                      Performance Metrics
                    </h3>
                    <Badge className={getGradeColor(result.grades.performance.grade)}>
                      {result.grades.performance.score}% - {result.grades.performance.grade}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
                    <div className="p-4 rounded-lg bg-muted/30 text-center">
                      <BarChart3 className="w-6 h-6 mx-auto mb-2 text-primary" />
                      <div className="text-xl font-bold">{result.performance.pageSize}KB</div>
                      <div className="text-xs text-muted-foreground">Page Size</div>
                    </div>
                    <div className="p-4 rounded-lg bg-muted/30 text-center">
                      <Clock className="w-6 h-6 mx-auto mb-2 text-primary" />
                      <div className="text-xl font-bold">{result.performance.responseTime}ms</div>
                      <div className="text-xs text-muted-foreground">Response Time</div>
                    </div>
                    <div className="p-4 rounded-lg bg-muted/30 text-center">
                      <Code className="w-6 h-6 mx-auto mb-2 text-primary" />
                      <div className="text-xl font-bold">{result.performance.scriptCount}</div>
                      <div className="text-xs text-muted-foreground">Scripts</div>
                    </div>
                    <div className="p-4 rounded-lg bg-muted/30 text-center">
                      <FileText className="w-6 h-6 mx-auto mb-2 text-primary" />
                      <div className="text-xl font-bold">{result.performance.stylesheetCount}</div>
                      <div className="text-xs text-muted-foreground">Stylesheets</div>
                    </div>
                    <div className="p-4 rounded-lg bg-muted/30 text-center">
                      <Image className="w-6 h-6 mx-auto mb-2 text-primary" />
                      <div className="text-xl font-bold">{result.performance.imageCount}</div>
                      <div className="text-xs text-muted-foreground">Images</div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {getChecksByCategory("performance").map((check, i) => (
                      <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-muted/20 hover:bg-muted/40 transition-colors">
                        <StatusIcon status={check.status} />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="font-medium">{check.name}</h4>
                            <PriorityBadge priority={check.priority} />
                          </div>
                          <p className="text-sm text-muted-foreground">{check.message}</p>
                          {check.recommendation && (
                            <p className="text-sm text-primary mt-1">{check.recommendation}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              </TabsContent>

              <TabsContent value="security" className="mt-6 space-y-4">
                <Card className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-semibold flex items-center gap-2">
                      <Shield className="w-5 h-5" />
                      Security Analysis
                    </h3>
                    <Badge className={getGradeColor(result.grades.security.grade)}>
                      {result.grades.security.score}% - {result.grades.security.grade}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
                    {Object.entries(result.securityHeaders).map(([header, enabled]) => (
                      <div key={header} className={`p-3 rounded-lg border ${enabled ? "bg-green-50 border-green-200 dark:bg-green-950/20 dark:border-green-800" : "bg-muted/30 border-transparent"}`}>
                        <div className="flex items-center gap-2">
                          {enabled ? <CheckCircle className="w-4 h-4 text-green-500" /> : <XCircle className="w-4 h-4 text-muted-foreground" />}
                          <span className="text-sm font-medium capitalize">{header.replace(/([A-Z])/g, ' $1').trim()}</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-3">
                    {getChecksByCategory("security").map((check, i) => (
                      <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-muted/20 hover:bg-muted/40 transition-colors">
                        <StatusIcon status={check.status} />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="font-medium">{check.name}</h4>
                            <PriorityBadge priority={check.priority} />
                          </div>
                          <p className="text-sm text-muted-foreground">{check.message}</p>
                          {check.recommendation && (
                            <p className="text-sm text-primary mt-1">{check.recommendation}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              </TabsContent>

              <TabsContent value="usability" className="mt-6 space-y-4">
                <Card className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-semibold flex items-center gap-2">
                      <Smartphone className="w-5 h-5" />
                      Usability & Accessibility
                    </h3>
                    <Badge className={getGradeColor(result.grades.usability.grade)}>
                      {result.grades.usability.score}% - {result.grades.usability.grade}
                    </Badge>
                  </div>

                  <div className="space-y-3">
                    {getChecksByCategory("usability").map((check, i) => (
                      <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-muted/20 hover:bg-muted/40 transition-colors">
                        <StatusIcon status={check.status} />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="font-medium">{check.name}</h4>
                            <PriorityBadge priority={check.priority} />
                          </div>
                          <p className="text-sm text-muted-foreground">{check.message}</p>
                          {check.recommendation && (
                            <p className="text-sm text-primary mt-1">{check.recommendation}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              </TabsContent>

              <TabsContent value="social" className="mt-6 space-y-4">
                <Card className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-semibold flex items-center gap-2">
                      <Share2 className="w-5 h-5" />
                      Social Media Presence
                    </h3>
                    <Badge className={getGradeColor(result.grades.social.grade)}>
                      {result.grades.social.score}% - {result.grades.social.grade}
                    </Badge>
                  </div>

                  {result.metadata.ogImage && (
                    <div className="mb-6 p-4 rounded-lg bg-muted/30">
                      <h4 className="font-medium mb-2">Social Share Preview</h4>
                      <div className="rounded-lg overflow-hidden border max-w-md">
                        <img 
                          src={result.metadata.ogImage} 
                          alt="Open Graph preview" 
                          className="w-full h-40 object-cover"
                          onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                        />
                        <div className="p-3 bg-background">
                          <p className="font-medium text-sm truncate">{result.metadata.title}</p>
                          <p className="text-xs text-muted-foreground truncate">{result.metadata.description}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="mb-6">
                    <h4 className="font-medium mb-3">Social Profiles Detected</h4>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {result.socialProfiles.map((profile, i) => (
                        <div 
                          key={i} 
                          className={`p-3 rounded-lg border ${profile.found ? "bg-green-50 border-green-200 dark:bg-green-950/20 dark:border-green-800" : "bg-muted/30 border-transparent"}`}
                        >
                          <div className="flex items-center gap-2">
                            {profile.found ? <CheckCircle className="w-4 h-4 text-green-500" /> : <XCircle className="w-4 h-4 text-muted-foreground" />}
                            <span className="font-medium capitalize text-sm">{profile.platform}</span>
                          </div>
                          {profile.url && (
                            <a 
                              href={profile.url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-xs text-primary hover:underline flex items-center gap-1 mt-1"
                            >
                              Visit <ExternalLink className="w-3 h-3" />
                            </a>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-3">
                    {getChecksByCategory("social").map((check, i) => (
                      <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-muted/20 hover:bg-muted/40 transition-colors">
                        <StatusIcon status={check.status} />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="font-medium">{check.name}</h4>
                            <PriorityBadge priority={check.priority} />
                          </div>
                          <p className="text-sm text-muted-foreground">{check.message}</p>
                          {check.recommendation && (
                            <p className="text-sm text-primary mt-1">{check.recommendation}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="border-t pt-6 mt-6">
                    <h4 className="font-medium mb-3 flex items-center gap-2">
                      <Users className="w-5 h-5" />
                      Track Your Social Stats (Optional)
                    </h4>
                    <p className="text-sm text-muted-foreground mb-4">
                      Manually enter follower counts to track your social presence over time.
                    </p>
                    <div className="grid sm:grid-cols-3 gap-4">
                      {["Instagram", "Twitter/X", "Facebook", "LinkedIn", "YouTube", "TikTok"].map((platform) => (
                        <div key={platform} className="p-3 rounded-lg bg-muted/30">
                          <Label className="text-sm font-medium mb-2 block">{platform}</Label>
                          <Input
                            placeholder="Followers"
                            value={socialStats[platform.toLowerCase()]?.followers || ""}
                            onChange={(e) => setSocialStats(prev => ({ ...prev, [platform.toLowerCase()]: { followers: e.target.value } }))}
                            className="h-8 text-sm"
                            data-testid={`input-${platform.toLowerCase().replace('/', '-')}-followers`}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        )}

        <HowItWorks 
          title="How Presence Audit Works"
          steps={howItWorksSteps}
        />

        <Features 
          title="Comprehensive Analysis"
          features={features}
        />

        <FAQSection 
          title="Frequently Asked Questions"
          faqs={faqItems}
        />
      </div>
    </div>
  );
}
