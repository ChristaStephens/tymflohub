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

export interface AuditResult {
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

async function fetchViaProxy(url: string): Promise<{ content: string; status: number; responseTime: number }> {
  const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`;
  const startTime = Date.now();
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);

  try {
    const response = await fetch(proxyUrl, { signal: controller.signal });
    clearTimeout(timeout);
    const responseTime = Date.now() - startTime;
    const content = await response.text();
    return { content, status: response.status, responseTime };
  } catch (error: any) {
    clearTimeout(timeout);
    if (error.name === "AbortError") {
      throw new Error("Request timeout. The website took too long to respond.");
    }
    throw error;
  }
}

async function fetchResourceExists(url: string): Promise<{ exists: boolean; content: string }> {
  try {
    const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`;
    const response = await fetch(proxyUrl, { signal: AbortSignal.timeout(8000) });
    if (response.ok) {
      const content = await response.text();
      return { exists: true, content };
    }
    return { exists: false, content: "" };
  } catch {
    return { exists: false, content: "" };
  }
}

function getGrade(score: number): string {
  if (score >= 90) return "A";
  if (score >= 80) return "B+";
  if (score >= 70) return "B";
  if (score >= 60) return "C";
  if (score >= 50) return "D";
  return "F";
}

function calculateCategoryScore(checks: Check[], category: string): number {
  const categoryChecks = checks.filter(c => c.category === category);
  if (categoryChecks.length === 0) return 50;
  const weights = { high: 3, medium: 2, low: 1 };
  let totalWeight = 0;
  let weightedScore = 0;
  categoryChecks.forEach(check => {
    const weight = weights[check.priority];
    totalWeight += weight;
    if (check.status === "pass") weightedScore += weight * 100;
    else if (check.status === "warning") weightedScore += weight * 60;
    else weightedScore += weight * 20;
  });
  return Math.round(weightedScore / totalWeight);
}

export async function runClientAudit(inputUrl: string): Promise<AuditResult> {
  let normalizedUrl = inputUrl.trim();
  if (!normalizedUrl.startsWith("http://") && !normalizedUrl.startsWith("https://")) {
    normalizedUrl = "https://" + normalizedUrl;
  }

  const urlObj = new URL(normalizedUrl);
  const baseUrl = `${urlObj.protocol}//${urlObj.host}`;
  const isHttps = normalizedUrl.startsWith("https://");

  let html = "";
  let responseTime = 0;
  let fetchError = false;

  try {
    const result = await fetchViaProxy(normalizedUrl);
    html = result.content;
    responseTime = result.responseTime;
    fetchError = result.status < 200 || result.status >= 400;
  } catch (error: any) {
    throw new Error(error.message || "Failed to fetch the website. It may be unreachable or blocking requests.");
  }

  if (fetchError || !html || html.trim().length === 0) {
    throw new Error("Could not retrieve website content. The site may be down, blocking automated requests, or the URL may be incorrect.");
  }
  const contentLength = html.length;

  const [robotsResult, sitemapResult] = await Promise.all([
    fetchResourceExists(`${baseUrl}/robots.txt`),
    fetchResourceExists(`${baseUrl}/sitemap.xml`),
  ]);

  const hasRobotsTxt = robotsResult.exists;
  const robotsTxtContent = robotsResult.content;
  const hasSitemapXml = sitemapResult.exists;

  const titleMatch = html.match(/<title[^>]*>([^<]*)<\/title>/i);
  const title = titleMatch?.[1]?.trim() || "";

  const descMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']*)["']/i) ||
                    html.match(/<meta[^>]*content=["']([^"']*)["'][^>]*name=["']description["']/i);
  const description = descMatch?.[1]?.trim() || "";

  const keywordsMatch = html.match(/<meta[^>]*name=["']keywords["'][^>]*content=["']([^"']*)["']/i);
  const keywords = keywordsMatch?.[1]?.trim() || "";

  const ogTitleMatch = html.match(/<meta[^>]*property=["']og:title["'][^>]*content=["']([^"']*)["']/i);
  const ogTitle = ogTitleMatch?.[1]?.trim() || "";
  const ogDescMatch = html.match(/<meta[^>]*property=["']og:description["'][^>]*content=["']([^"']*)["']/i);
  const ogDesc = ogDescMatch?.[1]?.trim() || "";
  const ogImageMatch = html.match(/<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']*)["']/i);
  const ogImage = ogImageMatch?.[1]?.trim() || "";
  const ogTypeMatch = html.match(/<meta[^>]*property=["']og:type["'][^>]*content=["']([^"']*)["']/i);
  const ogType = ogTypeMatch?.[1]?.trim() || "";
  const ogUrlMatch = html.match(/<meta[^>]*property=["']og:url["'][^>]*content=["']([^"']*)["']/i);
  const ogUrl = ogUrlMatch?.[1]?.trim() || "";

  const twitterCardMatch = html.match(/<meta[^>]*name=["']twitter:card["'][^>]*content=["']([^"']*)["']/i);
  const twitterCard = twitterCardMatch?.[1]?.trim() || "";
  const twitterImageMatch = html.match(/<meta[^>]*name=["']twitter:image["'][^>]*content=["']([^"']*)["']/i);
  const twitterImage = twitterImageMatch?.[1]?.trim() || "";

  const faviconMatch = html.match(/<link[^>]*rel=["'](?:shortcut )?icon["'][^>]*href=["']([^"']*)["']/i);
  const favicon = faviconMatch?.[1]?.trim() || "";

  const h1Matches = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/gi) || [];
  const h2Matches = html.match(/<h2[^>]*>([\s\S]*?)<\/h2>/gi) || [];
  const h3Matches = html.match(/<h3[^>]*>([\s\S]*?)<\/h3>/gi) || [];
  const h4Matches = html.match(/<h4[^>]*>([\s\S]*?)<\/h4>/gi) || [];
  const h5Matches = html.match(/<h5[^>]*>([\s\S]*?)<\/h5>/gi) || [];
  const h6Matches = html.match(/<h6[^>]*>([\s\S]*?)<\/h6>/gi) || [];

  const headingCounts = {
    h1: h1Matches.length,
    h2: h2Matches.length,
    h3: h3Matches.length,
    h4: h4Matches.length,
    h5: h5Matches.length,
    h6: h6Matches.length,
  };

  const imgMatches = html.match(/<img[^>]*>/gi) || [];
  const imgsWithAlt = imgMatches.filter(img => /alt=["'][^"']+["']/i.test(img)).length;
  const imgsWithEmptyAlt = imgMatches.filter(img => /alt=["']["']/i.test(img)).length;

  const allLinks = html.match(/<a[^>]*href=["']([^"']*)["'][^>]*>/gi) || [];
  const internalLinks = allLinks.filter(link => {
    const href = link.match(/href=["']([^"']*)["']/i)?.[1] || "";
    return href.startsWith("/") || href.includes(urlObj.host);
  });
  const externalLinks = allLinks.filter(link => {
    const href = link.match(/href=["']([^"']*)["']/i)?.[1] || "";
    return href.startsWith("http") && !href.includes(urlObj.host);
  });
  const nofollowLinks = allLinks.filter(link => /rel=["'][^"']*nofollow[^"']*["']/i.test(link));

  const scriptTags = (html.match(/<script[^>]*>/gi) || []).length;
  const stylesheetLinks = (html.match(/<link[^>]*rel=["']stylesheet["'][^>]*>/gi) || []).length;
  const inlineStyles = (html.match(/<style[^>]*>/gi) || []).length;

  const hasLangAttr = /<html[^>]*lang=["'][^"']+["']/i.test(html);
  const formInputs = html.match(/<input[^>]*>/gi) || [];
  const inputsWithLabels = formInputs.filter(input => {
    const id = input.match(/id=["']([^"']*)["']/i)?.[1];
    return id && html.includes(`for="${id}"`);
  }).length;

  const hasJsonLd = /<script[^>]*type=["']application\/ld\+json["'][^>]*>/i.test(html);
  const hasMicrodata = /itemscope|itemtype/i.test(html);

  const hasViewport = /<meta[^>]*name=["']viewport["']/i.test(html);
  const hasCanonical = /<link[^>]*rel=["']canonical["']/i.test(html);
  const hasCharset = /<meta[^>]*charset=/i.test(html);

  const httpResources = html.match(/(?:src|href)=["']http:\/\/[^"']+["']/gi) || [];
  const hasMixedContent = isHttps && httpResources.length > 0;

  const socialPlatforms = [
    { platform: "facebook", patterns: [/facebook\.com\/[^"'\s]+/i, /fb\.com\/[^"'\s]+/i] },
    { platform: "twitter", patterns: [/twitter\.com\/[^"'\s]+/i, /x\.com\/[^"'\s]+/i] },
    { platform: "instagram", patterns: [/instagram\.com\/[^"'\s]+/i] },
    { platform: "linkedin", patterns: [/linkedin\.com\/(?:company|in)\/[^"'\s]+/i] },
    { platform: "youtube", patterns: [/youtube\.com\/(?:channel|c|user|@)[^"'\s]+/i] },
    { platform: "tiktok", patterns: [/tiktok\.com\/@[^"'\s]+/i] },
    { platform: "pinterest", patterns: [/pinterest\.com\/[^"'\s]+/i] },
    { platform: "github", patterns: [/github\.com\/[^"'\s]+/i] },
  ];

  const socialProfiles: SocialProfile[] = socialPlatforms.map(({ platform, patterns }) => {
    let found = false;
    let detectedUrl: string | undefined;
    for (const pattern of patterns) {
      const match = html.match(pattern);
      if (match) {
        found = true;
        detectedUrl = match[0].startsWith("http") ? match[0] : `https://${match[0]}`;
        break;
      }
    }
    return { platform, found, url: detectedUrl };
  });

  const checks: Check[] = [];

  if (!title) {
    checks.push({ name: "Page Title", status: "fail", message: "No title tag found", recommendation: "Add a descriptive title tag (50-60 characters)", category: "seo", priority: "high" });
  } else if (title.length < 30) {
    checks.push({ name: "Page Title", status: "warning", message: `Title is short (${title.length} chars)`, recommendation: "Consider a longer title (50-60 characters)", category: "seo", priority: "medium" });
  } else if (title.length > 70) {
    checks.push({ name: "Page Title", status: "warning", message: `Title is long (${title.length} chars)`, recommendation: "Keep title under 60 characters", category: "seo", priority: "low" });
  } else {
    checks.push({ name: "Page Title", status: "pass", message: `Good title length (${title.length} chars)`, category: "seo", priority: "high" });
  }

  if (!description) {
    checks.push({ name: "Meta Description", status: "fail", message: "No meta description found", recommendation: "Add a meta description (150-160 characters)", category: "seo", priority: "high" });
  } else if (description.length < 100) {
    checks.push({ name: "Meta Description", status: "warning", message: `Description is short (${description.length} chars)`, recommendation: "Expand to 150-160 characters", category: "seo", priority: "medium" });
  } else if (description.length > 170) {
    checks.push({ name: "Meta Description", status: "warning", message: `Description may be truncated (${description.length} chars)`, recommendation: "Keep under 160 characters", category: "seo", priority: "low" });
  } else {
    checks.push({ name: "Meta Description", status: "pass", message: `Good description length (${description.length} chars)`, category: "seo", priority: "high" });
  }

  if (headingCounts.h1 === 0) {
    checks.push({ name: "H1 Heading", status: "fail", message: "No H1 heading found", recommendation: "Add one H1 heading with your main keyword", category: "seo", priority: "high" });
  } else if (headingCounts.h1 > 1) {
    checks.push({ name: "H1 Heading", status: "warning", message: `Multiple H1s found (${headingCounts.h1})`, recommendation: "Use only one H1 per page", category: "seo", priority: "medium" });
  } else {
    checks.push({ name: "H1 Heading", status: "pass", message: "Single H1 heading found", category: "seo", priority: "high" });
  }

  const totalHeadings = Object.values(headingCounts).reduce((a, b) => a + b, 0);
  if (totalHeadings < 3) {
    checks.push({ name: "Heading Structure", status: "warning", message: `Only ${totalHeadings} headings found`, recommendation: "Use more headings to structure content", category: "seo", priority: "medium" });
  } else {
    checks.push({ name: "Heading Structure", status: "pass", message: `Good heading structure (${totalHeadings} headings)`, category: "seo", priority: "medium" });
  }

  if (keywords) {
    checks.push({ name: "Meta Keywords", status: "pass", message: "Keywords meta tag present", category: "seo", priority: "low" });
  }

  if (imgMatches.length === 0) {
    checks.push({ name: "Image Alt Tags", status: "pass", message: "No images to check", category: "seo", priority: "medium" });
  } else if (imgsWithAlt < imgMatches.length) {
    const missing = imgMatches.length - imgsWithAlt - imgsWithEmptyAlt;
    checks.push({ name: "Image Alt Tags", status: missing > 0 ? "warning" : "pass", message: `${imgsWithAlt}/${imgMatches.length} images have alt text`, recommendation: missing > 0 ? "Add descriptive alt text to all images" : undefined, category: "seo", priority: "medium" });
  } else {
    checks.push({ name: "Image Alt Tags", status: "pass", message: `All ${imgMatches.length} images have alt text`, category: "seo", priority: "medium" });
  }

  if (hasCanonical) {
    checks.push({ name: "Canonical URL", status: "pass", message: "Canonical link present", category: "seo", priority: "medium" });
  } else {
    checks.push({ name: "Canonical URL", status: "warning", message: "No canonical URL specified", recommendation: "Add canonical link to prevent duplicate content", category: "seo", priority: "medium" });
  }

  if (hasRobotsTxt) {
    checks.push({ name: "Robots.txt", status: "pass", message: "robots.txt file found", category: "seo", priority: "medium" });
  } else {
    checks.push({ name: "Robots.txt", status: "warning", message: "No robots.txt file found", recommendation: "Add robots.txt to control crawler access", category: "seo", priority: "low" });
  }

  if (hasSitemapXml) {
    checks.push({ name: "XML Sitemap", status: "pass", message: "sitemap.xml found", category: "seo", priority: "medium" });
  } else if (robotsTxtContent.toLowerCase().includes("sitemap:")) {
    checks.push({ name: "XML Sitemap", status: "pass", message: "Sitemap referenced in robots.txt", category: "seo", priority: "medium" });
  } else {
    checks.push({ name: "XML Sitemap", status: "warning", message: "No sitemap.xml found", recommendation: "Add an XML sitemap for better indexing", category: "seo", priority: "medium" });
  }

  if (hasJsonLd || hasMicrodata) {
    checks.push({ name: "Structured Data", status: "pass", message: hasJsonLd ? "JSON-LD structured data found" : "Microdata found", category: "seo", priority: "medium" });
  } else {
    checks.push({ name: "Structured Data", status: "warning", message: "No structured data found", recommendation: "Add Schema.org markup for rich snippets", category: "seo", priority: "low" });
  }

  checks.push({ name: "Internal Links", status: internalLinks.length >= 3 ? "pass" : "warning", message: `${internalLinks.length} internal links found`, recommendation: internalLinks.length < 3 ? "Add more internal links for better navigation" : undefined, category: "seo", priority: "low" });
  checks.push({ name: "External Links", status: "pass", message: `${externalLinks.length} external links found`, category: "seo", priority: "low" });

  const pageSizeKB = Math.round(contentLength / 1024);
  if (pageSizeKB > 500) {
    checks.push({ name: "Page Size", status: "warning", message: `Page is ${pageSizeKB}KB`, recommendation: "Consider reducing page size for faster loading", category: "performance", priority: "high" });
  } else if (pageSizeKB > 200) {
    checks.push({ name: "Page Size", status: "pass", message: `Page is ${pageSizeKB}KB`, category: "performance", priority: "high" });
  } else {
    checks.push({ name: "Page Size", status: "pass", message: `Excellent page size (${pageSizeKB}KB)`, category: "performance", priority: "high" });
  }

  if (responseTime > 3000) {
    checks.push({ name: "Response Time", status: "fail", message: `Slow response (${responseTime}ms)`, recommendation: "Optimize server response time", category: "performance", priority: "high" });
  } else if (responseTime > 1500) {
    checks.push({ name: "Response Time", status: "warning", message: `Response time ${responseTime}ms`, recommendation: "Consider optimizing server performance", category: "performance", priority: "medium" });
  } else {
    checks.push({ name: "Response Time", status: "pass", message: `Fast response (${responseTime}ms)`, category: "performance", priority: "high" });
  }

  if (scriptTags > 15) {
    checks.push({ name: "JavaScript Files", status: "warning", message: `${scriptTags} script tags found`, recommendation: "Consider bundling scripts", category: "performance", priority: "medium" });
  } else {
    checks.push({ name: "JavaScript Files", status: "pass", message: `${scriptTags} script tags`, category: "performance", priority: "medium" });
  }

  if (stylesheetLinks + inlineStyles > 10) {
    checks.push({ name: "CSS Files", status: "warning", message: `${stylesheetLinks} stylesheets, ${inlineStyles} inline styles`, recommendation: "Consider bundling CSS files", category: "performance", priority: "medium" });
  } else {
    checks.push({ name: "CSS Files", status: "pass", message: `${stylesheetLinks} stylesheets`, category: "performance", priority: "medium" });
  }

  if (imgMatches.length > 30) {
    checks.push({ name: "Image Count", status: "warning", message: `${imgMatches.length} images on page`, recommendation: "Consider lazy loading images", category: "performance", priority: "medium" });
  } else {
    checks.push({ name: "Image Count", status: "pass", message: `${imgMatches.length} images`, category: "performance", priority: "low" });
  }

  if (isHttps) {
    checks.push({ name: "HTTPS", status: "pass", message: "Site uses HTTPS", category: "security", priority: "high" });
  } else {
    checks.push({ name: "HTTPS", status: "fail", message: "Site does not use HTTPS", recommendation: "Enable SSL/TLS certificate", category: "security", priority: "high" });
  }

  checks.push({ name: "HSTS Header", status: "warning", message: "Unable to check via client-side audit (CORS proxy strips headers)", category: "security", priority: "medium" });
  checks.push({ name: "Content Security Policy", status: "warning", message: "Unable to check via client-side audit (CORS proxy strips headers)", category: "security", priority: "low" });
  checks.push({ name: "X-Frame-Options", status: "warning", message: "Unable to check via client-side audit (CORS proxy strips headers)", category: "security", priority: "low" });

  if (hasMixedContent) {
    checks.push({ name: "Mixed Content", status: "fail", message: `${httpResources.length} HTTP resources on HTTPS page`, recommendation: "Update all resources to use HTTPS", category: "security", priority: "high" });
  } else if (isHttps) {
    checks.push({ name: "Mixed Content", status: "pass", message: "No mixed content detected", category: "security", priority: "high" });
  }

  if (hasViewport) {
    checks.push({ name: "Mobile Viewport", status: "pass", message: "Viewport meta tag present", category: "usability", priority: "high" });
  } else {
    checks.push({ name: "Mobile Viewport", status: "fail", message: "No viewport meta tag", recommendation: "Add viewport for mobile responsiveness", category: "usability", priority: "high" });
  }

  if (hasLangAttr) {
    checks.push({ name: "Language Attribute", status: "pass", message: "HTML lang attribute set", category: "usability", priority: "medium" });
  } else {
    checks.push({ name: "Language Attribute", status: "warning", message: "No lang attribute on HTML", recommendation: "Add lang attribute for accessibility", category: "usability", priority: "medium" });
  }

  if (hasCharset) {
    checks.push({ name: "Character Encoding", status: "pass", message: "Charset defined", category: "usability", priority: "medium" });
  } else {
    checks.push({ name: "Character Encoding", status: "warning", message: "No charset meta tag", recommendation: "Add charset meta tag", category: "usability", priority: "low" });
  }

  if (favicon) {
    checks.push({ name: "Favicon", status: "pass", message: "Favicon present", category: "usability", priority: "low" });
  } else {
    checks.push({ name: "Favicon", status: "warning", message: "No favicon found", recommendation: "Add a favicon for browser tabs", category: "usability", priority: "low" });
  }

  if (formInputs.length > 0) {
    const labelRatio = inputsWithLabels / formInputs.length;
    if (labelRatio < 0.5) {
      checks.push({ name: "Form Labels", status: "warning", message: `${inputsWithLabels}/${formInputs.length} inputs have labels`, recommendation: "Add labels to form inputs for accessibility", category: "usability", priority: "medium" });
    } else {
      checks.push({ name: "Form Labels", status: "pass", message: "Form inputs have associated labels", category: "usability", priority: "medium" });
    }
  }

  const ogComplete = ogTitle && ogDesc && ogImage && ogType && ogUrl;
  const ogPartial = ogTitle || ogDesc || ogImage;
  if (ogComplete) {
    checks.push({ name: "Open Graph Tags", status: "pass", message: "Complete Open Graph implementation", category: "social", priority: "high" });
  } else if (ogPartial) {
    checks.push({ name: "Open Graph Tags", status: "warning", message: "Partial Open Graph implementation", recommendation: "Add og:title, og:description, og:image, og:type, og:url", category: "social", priority: "medium" });
  } else {
    checks.push({ name: "Open Graph Tags", status: "fail", message: "No Open Graph tags found", recommendation: "Add OG tags for better social sharing", category: "social", priority: "high" });
  }

  if (twitterCard && twitterImage) {
    checks.push({ name: "Twitter Cards", status: "pass", message: `Twitter Card type: ${twitterCard}`, category: "social", priority: "medium" });
  } else if (twitterCard) {
    checks.push({ name: "Twitter Cards", status: "warning", message: "Twitter Card partially configured", recommendation: "Add twitter:image for better previews", category: "social", priority: "low" });
  } else {
    checks.push({ name: "Twitter Cards", status: "warning", message: "No Twitter Card tags", recommendation: "Add Twitter Card meta tags", category: "social", priority: "low" });
  }

  const socialFound = socialProfiles.filter(p => p.found).length;
  if (socialFound >= 4) {
    checks.push({ name: "Social Media Links", status: "pass", message: `${socialFound} social profiles linked`, category: "social", priority: "medium" });
  } else if (socialFound >= 2) {
    checks.push({ name: "Social Media Links", status: "pass", message: `${socialFound} social profiles linked`, category: "social", priority: "medium" });
  } else if (socialFound >= 1) {
    checks.push({ name: "Social Media Links", status: "warning", message: `Only ${socialFound} social profile linked`, recommendation: "Link to more social media profiles", category: "social", priority: "low" });
  } else {
    checks.push({ name: "Social Media Links", status: "warning", message: "No social media links found", recommendation: "Add links to your social profiles", category: "social", priority: "low" });
  }

  const seoScore = calculateCategoryScore(checks, "seo");
  const performanceScore = calculateCategoryScore(checks, "performance");
  const securityScore = calculateCategoryScore(checks, "security");
  const usabilityScore = calculateCategoryScore(checks, "usability");
  const socialScore = calculateCategoryScore(checks, "social");

  const overallScore = Math.round(
    (seoScore * 0.30) +
    (performanceScore * 0.20) +
    (securityScore * 0.20) +
    (usabilityScore * 0.15) +
    (socialScore * 0.15)
  );

  const recommendations: string[] = [];
  const highPriorityFails = checks.filter(c => c.status === "fail" && c.priority === "high" && c.recommendation);
  const mediumPriorityFails = checks.filter(c => c.status === "fail" && c.priority === "medium" && c.recommendation);
  const highPriorityWarnings = checks.filter(c => c.status === "warning" && c.priority === "high" && c.recommendation);

  highPriorityFails.forEach(c => recommendations.push(c.recommendation!));
  mediumPriorityFails.forEach(c => recommendations.push(c.recommendation!));
  highPriorityWarnings.slice(0, 3).forEach(c => recommendations.push(c.recommendation!));

  if (recommendations.length === 0) {
    recommendations.push("Excellent! Your website follows best practices. Consider monitoring performance over time.");
  }

  const securityHeaders = {
    hsts: false,
    csp: false,
    xFrameOptions: false,
    xContentTypeOptions: false,
    xXssProtection: false,
    referrerPolicy: false,
  };

  return {
    url: normalizedUrl,
    timestamp: new Date().toISOString(),
    overallScore,
    grades: {
      seo: { score: seoScore, grade: getGrade(seoScore) },
      performance: { score: performanceScore, grade: getGrade(performanceScore) },
      security: { score: securityScore, grade: getGrade(securityScore) },
      usability: { score: usabilityScore, grade: getGrade(usabilityScore) },
      social: { score: socialScore, grade: getGrade(socialScore) },
    },
    checks,
    socialProfiles,
    recommendations,
    metadata: {
      title,
      description,
      keywords,
      favicon,
      ogImage,
      twitterCard,
    },
    performance: {
      pageSize: pageSizeKB,
      responseTime,
      scriptCount: scriptTags,
      stylesheetCount: stylesheetLinks,
      imageCount: imgMatches.length,
    },
    links: {
      internal: internalLinks.length,
      external: externalLinks.length,
      nofollow: nofollowLinks.length,
    },
    headings: headingCounts,
    securityHeaders,
  };
}
