import type { Express } from "express";
import { createServer, type Server } from "http";
import multer from "multer";
import { PDFDocument } from "pdf-lib";
import sharp from "sharp";
import { promises as fs } from "fs";
import path from "path";
import crypto from "crypto";
import { storage } from "./storage";
import Stripe from "stripe";
import { setupAuth, isAuthenticated } from "./replitAuth";

// Initialize Stripe - blueprint:javascript_stripe integration
// Use production key if available, fallback to testing key for development
const stripeKey = process.env.STRIPE_SECRET_KEY || process.env.TESTING_STRIPE_SECRET_KEY;
const stripe = stripeKey
  ? new Stripe(stripeKey, {
      apiVersion: "2025-09-30.clover",
    })
  : null;

if (!stripe && process.env.NODE_ENV === 'production') {
  console.warn('[Stripe] WARNING: No Stripe API key configured in production');
} else if (stripe) {
  console.log('[Stripe] Initialized with', process.env.STRIPE_SECRET_KEY ? 'production' : 'testing', 'credentials');
}

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit for free tier
  },
});

// Temporary directory for processed files
const TEMP_DIR = path.join(process.cwd(), "temp");

// Ensure temp directory exists
async function ensureTempDir() {
  try {
    await fs.access(TEMP_DIR);
  } catch {
    await fs.mkdir(TEMP_DIR, { recursive: true });
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  await ensureTempDir();

  // Auth middleware - blueprint:javascript_log_in_with_replit
  // Retry setupAuth to handle transient DNS errors (EAI_AGAIN)
  let authSetupAttempts = 0;
  const maxAuthSetupAttempts = 3;
  
  while (authSetupAttempts < maxAuthSetupAttempts) {
    try {
      await setupAuth(app);
      console.log("[Server] ✓ Authentication setup successful");
      break;
    } catch (error: any) {
      authSetupAttempts++;
      
      console.error(`[Server] Auth setup attempt ${authSetupAttempts}/${maxAuthSetupAttempts} failed:`, {
        code: error.code,
        errno: error.errno,
        message: error.message,
        stack: error.stack?.split('\n').slice(0, 3).join('\n')
      });
      
      // Check if it's a transient DNS error
      const isTransientDnsError = 
        error.code === 'EAI_AGAIN' || 
        error.errno === 'EAI_AGAIN' ||
        error.message?.includes('EAI_AGAIN') || 
        error.message?.includes('getaddrinfo') ||
        error.message?.includes('helium');
      
      if (isTransientDnsError && authSetupAttempts < maxAuthSetupAttempts) {
        const delayMs = 2000; // Fixed 2 second delay
        console.log(`[Server] → Retrying in ${delayMs}ms...`);
        await new Promise(resolve => setTimeout(resolve, delayMs));
      } else {
        console.error("[Server] ✗ CRITICAL: Failed to setup authentication after all retries");
        console.error("[Server] Error details:", JSON.stringify({
          code: error.code,
          message: error.message,
          isTransientDnsError
        }));
        throw error;
      }
    }
  }

  // Health check endpoint - must be accessible without auth
  app.get('/health', async (_req, res) => {
    try {
      // Test database connection
      const { neon } = await import("@neondatabase/serverless");
      const sql = neon(process.env.DATABASE_URL!);
      await sql`SELECT 1 as health_check`;
      
      res.status(200).json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        services: {
          database: 'connected',
          server: 'running'
        }
      });
    } catch (error: any) {
      console.error('[Health] Database connection failed:', error.message);
      res.status(503).json({
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        services: {
          database: 'disconnected',
          server: 'running'
        },
        error: error.message
      });
    }
  });

  // Auth routes - blueprint:javascript_log_in_with_replit
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // PDF Merge endpoint
  app.post("/api/pdf/merge", upload.array("files", 5), async (req, res) => {
    try {
      const files = req.files as Express.Multer.File[];
      
      if (!files || files.length < 2) {
        return res.status(400).json({ error: "At least 2 PDF files required" });
      }

      // Create a new PDF document
      const mergedPdf = await PDFDocument.create();

      // Load and merge each PDF
      for (const file of files) {
        const pdf = await PDFDocument.load(file.buffer);
        const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
        copiedPages.forEach((page) => mergedPdf.addPage(page));
      }

      // Save the merged PDF
      const mergedPdfBytes = await mergedPdf.save();
      
      // Generate unique filename
      const filename = `merged-${Date.now()}.pdf`;
      const filepath = path.join(TEMP_DIR, filename);
      
      await fs.writeFile(filepath, mergedPdfBytes);

      // Schedule file deletion after 1 hour
      setTimeout(async () => {
        try {
          await fs.unlink(filepath);
        } catch (error) {
          console.error("Error deleting file:", error);
        }
      }, 60 * 60 * 1000);

      res.json({
        success: true,
        filename,
        downloadUrl: `/api/download/${filename}`,
      });
    } catch (error) {
      console.error("PDF merge error:", error);
      res.status(500).json({ error: "Failed to merge PDFs" });
    }
  });

  // PDF Split endpoint
  app.post("/api/pdf/split", upload.single("file"), async (req, res) => {
    try {
      const file = req.file;
      const { startPage, endPage } = req.body;

      if (!file) {
        return res.status(400).json({ error: "PDF file required" });
      }

      const pdf = await PDFDocument.load(file.buffer);
      const totalPages = pdf.getPageCount();

      const start = parseInt(startPage) || 1;
      const end = endPage ? parseInt(endPage) : totalPages;

      if (start < 1 || end > totalPages || start > end || start < 1) {
        return res.status(400).json({ error: "Invalid page range" });
      }

      // Create new PDF with selected pages
      const newPdf = await PDFDocument.create();
      const pages = await newPdf.copyPages(
        pdf,
        Array.from({ length: end - start + 1 }, (_, i) => start - 1 + i)
      );
      pages.forEach((page) => newPdf.addPage(page));

      const pdfBytes = await newPdf.save();
      
      const filename = `split-${Date.now()}.pdf`;
      const filepath = path.join(TEMP_DIR, filename);
      
      await fs.writeFile(filepath, pdfBytes);

      // Schedule file deletion after 1 hour
      setTimeout(async () => {
        try {
          await fs.unlink(filepath);
        } catch (error) {
          console.error("Error deleting file:", error);
        }
      }, 60 * 60 * 1000);

      res.json({
        success: true,
        filename,
        downloadUrl: `/api/download/${filename}`,
      });
    } catch (error) {
      console.error("PDF split error:", error);
      res.status(500).json({ error: "Failed to split PDF" });
    }
  });

  // PDF Compress endpoint
  app.post("/api/pdf/compress", upload.single("file"), async (req, res) => {
    try {
      const file = req.file;

      if (!file) {
        return res.status(400).json({ error: "PDF file required" });
      }

      // Load and re-save PDF (basic compression)
      const pdf = await PDFDocument.load(file.buffer);
      const compressedBytes = await pdf.save({
        useObjectStreams: true,
        addDefaultPage: false,
      });

      const filename = `compressed-${Date.now()}.pdf`;
      const filepath = path.join(TEMP_DIR, filename);
      
      await fs.writeFile(filepath, compressedBytes);

      // Calculate compression ratio
      const originalSize = file.buffer.length;
      const compressedSize = compressedBytes.length;
      const compressionRatio = ((1 - compressedSize / originalSize) * 100).toFixed(1);

      // Schedule file deletion after 1 hour
      setTimeout(async () => {
        try {
          await fs.unlink(filepath);
        } catch (error) {
          console.error("Error deleting file:", error);
        }
      }, 60 * 60 * 1000);

      res.json({
        success: true,
        filename,
        downloadUrl: `/api/download/${filename}`,
        originalSize,
        compressedSize,
        compressionRatio,
      });
    } catch (error) {
      console.error("PDF compress error:", error);
      res.status(500).json({ error: "Failed to compress PDF" });
    }
  });

  // Image Convert endpoint
  app.post("/api/image/convert", upload.single("file"), async (req, res) => {
    try {
      const file = req.file;
      const { format } = req.body;

      if (!file) {
        return res.status(400).json({ error: "Image file required" });
      }

      if (!["png", "jpg", "jpeg", "webp"].includes(format?.toLowerCase())) {
        return res.status(400).json({ error: "Invalid format. Use png, jpg, or webp" });
      }

      let image = sharp(file.buffer);

      // Convert to requested format
      if (format.toLowerCase() === "jpg" || format.toLowerCase() === "jpeg") {
        image = image.jpeg({ quality: 90 });
      } else if (format.toLowerCase() === "png") {
        image = image.png({ compressionLevel: 9 });
      } else if (format.toLowerCase() === "webp") {
        image = image.webp({ quality: 90 });
      }

      const convertedBuffer = await image.toBuffer();

      const filename = `converted-${Date.now()}.${format.toLowerCase()}`;
      const filepath = path.join(TEMP_DIR, filename);
      
      await fs.writeFile(filepath, convertedBuffer);

      // Schedule file deletion after 1 hour
      setTimeout(async () => {
        try {
          await fs.unlink(filepath);
        } catch (error) {
          console.error("Error deleting file:", error);
        }
      }, 60 * 60 * 1000);

      res.json({
        success: true,
        filename,
        downloadUrl: `/api/download/${filename}`,
      });
    } catch (error) {
      console.error("Image convert error:", error);
      res.status(500).json({ error: "Failed to convert image" });
    }
  });

  // E-Sign metadata endpoint - provides server timestamp and IP for audit trail
  app.post("/api/esign/metadata", (req, res) => {
    try {
      // Get client IP address
      const forwarded = req.headers['x-forwarded-for'];
      const ip = forwarded 
        ? (typeof forwarded === 'string' ? forwarded.split(',')[0] : forwarded[0])
        : req.socket.remoteAddress || 'Unknown';
      
      // Server-side timestamp (authoritative)
      const timestamp = new Date().toISOString();
      const formattedDate = new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
      const formattedTime = new Date().toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        timeZoneName: 'short',
      });

      // Generate signing ID for reference
      const signingId = `SIGN-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

      res.json({
        success: true,
        metadata: {
          timestamp,
          formattedDate,
          formattedTime,
          ip: ip.replace('::ffff:', ''), // Clean IPv6-mapped IPv4
          signingId,
          serverVerified: true,
        },
      });
    } catch (error) {
      console.error("E-sign metadata error:", error);
      res.status(500).json({ error: "Failed to generate signing metadata" });
    }
  });

  // File download endpoint
  app.get("/api/download/:filename", async (req, res) => {
    try {
      const { filename } = req.params;
      const filepath = path.join(TEMP_DIR, filename);

      // Check if file exists
      try {
        await fs.access(filepath);
      } catch {
        return res.status(404).json({ error: "File not found or expired" });
      }

      // Set appropriate headers
      res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
      res.setHeader("Content-Type", "application/octet-stream");

      // Stream the file
      const fileBuffer = await fs.readFile(filepath);
      res.send(fileBuffer);
    } catch (error) {
      console.error("Download error:", error);
      res.status(500).json({ error: "Failed to download file" });
    }
  });

  // Stripe Checkout Session Creation - blueprint:javascript_stripe integration
  app.post("/api/create-checkout-session", async (req, res) => {
    if (!stripe) {
      return res.status(500).json({ 
        error: "Stripe is not configured. Please set STRIPE_SECRET_KEY environment variable." 
      });
    }

    try {
      const { priceId, planName } = req.body;
      
      if (!priceId) {
        return res.status(400).json({ error: "Price ID is required" });
      }

      const session = await stripe.checkout.sessions.create({
        mode: "subscription",
        payment_method_types: ["card"],
        line_items: [
          {
            price: priceId,
            quantity: 1,
          },
        ],
        success_url: `${req.headers.origin || "http://localhost:5000"}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${req.headers.origin || "http://localhost:5000"}/pricing`,
        metadata: {
          planName: planName || "Unknown",
        },
      });

      res.json({ url: session.url });
    } catch (error: any) {
      console.error("Stripe checkout error:", error);
      res.status(500).json({ 
        error: "Failed to create checkout session", 
        message: error.message 
      });
    }
  });

  // ============= WEBSITE AUDIT ENDPOINT =============

  app.post("/api/audit/website", async (req, res) => {
    try {
      const { url } = req.body;
      
      if (!url) {
        return res.status(400).json({ error: "URL is required" });
      }

      // Normalize URL
      let normalizedUrl = url.trim();
      if (!normalizedUrl.startsWith("http://") && !normalizedUrl.startsWith("https://")) {
        normalizedUrl = "https://" + normalizedUrl;
      }

      const urlObj = new URL(normalizedUrl);
      const baseUrl = `${urlObj.protocol}//${urlObj.host}`;

      // Fetch the website with response headers
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 15000);

      let html = "";
      let responseHeaders: Record<string, string> = {};
      let fetchError = false;
      let isHttps = normalizedUrl.startsWith("https://");
      let responseTime = 0;
      let contentLength = 0;

      const startTime = Date.now();
      try {
        const response = await fetch(normalizedUrl, {
          signal: controller.signal,
          headers: {
            "User-Agent": "TymFlo-Presence-Audit/1.0 (+https://hub.tymflo.com)",
            "Accept": "text/html,application/xhtml+xml",
          },
        });
        clearTimeout(timeout);
        responseTime = Date.now() - startTime;

        if (!response.ok) {
          fetchError = true;
        } else {
          html = await response.text();
          contentLength = html.length;
          response.headers.forEach((value, key) => {
            responseHeaders[key.toLowerCase()] = value;
          });
        }
      } catch (error: any) {
        clearTimeout(timeout);
        if (error.name === "AbortError") {
          return res.status(408).json({ error: "Request timeout. The website took too long to respond." });
        }
        fetchError = true;
      }

      // Parallel fetch robots.txt and sitemap.xml
      let hasRobotsTxt = false;
      let hasSitemapXml = false;
      let robotsTxtContent = "";

      try {
        const [robotsRes, sitemapRes] = await Promise.all([
          fetch(`${baseUrl}/robots.txt`, { signal: AbortSignal.timeout(5000) }).catch(() => null),
          fetch(`${baseUrl}/sitemap.xml`, { signal: AbortSignal.timeout(5000) }).catch(() => null),
        ]);
        
        if (robotsRes?.ok) {
          hasRobotsTxt = true;
          robotsTxtContent = await robotsRes.text();
        }
        if (sitemapRes?.ok) {
          hasSitemapXml = true;
        }
      } catch {
        // Ignore errors for robots/sitemap
      }

      // Parse HTML and extract elements
      const titleMatch = html.match(/<title[^>]*>([^<]*)<\/title>/i);
      const title = titleMatch?.[1]?.trim() || "";

      const descMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']*)["']/i) ||
                        html.match(/<meta[^>]*content=["']([^"']*)["'][^>]*name=["']description["']/i);
      const description = descMatch?.[1]?.trim() || "";

      // Extract keywords
      const keywordsMatch = html.match(/<meta[^>]*name=["']keywords["'][^>]*content=["']([^"']*)["']/i);
      const keywords = keywordsMatch?.[1]?.trim() || "";

      // Open Graph tags
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

      // Twitter Card tags
      const twitterCardMatch = html.match(/<meta[^>]*name=["']twitter:card["'][^>]*content=["']([^"']*)["']/i);
      const twitterCard = twitterCardMatch?.[1]?.trim() || "";
      const twitterSiteMatch = html.match(/<meta[^>]*name=["']twitter:site["'][^>]*content=["']([^"']*)["']/i);
      const twitterSite = twitterSiteMatch?.[1]?.trim() || "";
      const twitterImageMatch = html.match(/<meta[^>]*name=["']twitter:image["'][^>]*content=["']([^"']*)["']/i);
      const twitterImage = twitterImageMatch?.[1]?.trim() || "";

      // Favicon
      const faviconMatch = html.match(/<link[^>]*rel=["'](?:shortcut )?icon["'][^>]*href=["']([^"']*)["']/i);
      const favicon = faviconMatch?.[1]?.trim() || "";

      // Headings analysis
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

      // Images analysis
      const imgMatches = html.match(/<img[^>]*>/gi) || [];
      const imgsWithAlt = imgMatches.filter(img => /alt=["'][^"']+["']/i.test(img)).length;
      const imgsWithEmptyAlt = imgMatches.filter(img => /alt=["']["']/i.test(img)).length;

      // Links analysis
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

      // Performance metrics
      const scriptTags = (html.match(/<script[^>]*>/gi) || []).length;
      const stylesheetLinks = (html.match(/<link[^>]*rel=["']stylesheet["'][^>]*>/gi) || []).length;
      const inlineStyles = (html.match(/<style[^>]*>/gi) || []).length;
      const inlineScripts = (html.match(/<script[^>]*>[\s\S]*?<\/script>/gi) || []).filter(s => !s.includes('src=')).length;

      // Accessibility checks
      const hasLangAttr = /<html[^>]*lang=["'][^"']+["']/i.test(html);
      const formInputs = (html.match(/<input[^>]*>/gi) || []);
      const inputsWithLabels = formInputs.filter(input => {
        const id = input.match(/id=["']([^"']*)["']/i)?.[1];
        return id && html.includes(`for="${id}"`);
      }).length;

      // Structured data
      const hasJsonLd = /<script[^>]*type=["']application\/ld\+json["'][^>]*>/i.test(html);
      const hasMicrodata = /itemscope|itemtype/i.test(html);

      // Meta tags
      const hasViewport = /<meta[^>]*name=["']viewport["']/i.test(html);
      const hasCanonical = /<link[^>]*rel=["']canonical["']/i.test(html);
      const hasRobotsMeta = /<meta[^>]*name=["']robots["']/i.test(html);
      const hasCharset = /<meta[^>]*charset=/i.test(html);

      // Security headers analysis
      const securityHeaders = {
        hsts: !!responseHeaders['strict-transport-security'],
        csp: !!responseHeaders['content-security-policy'],
        xFrameOptions: !!responseHeaders['x-frame-options'],
        xContentTypeOptions: !!responseHeaders['x-content-type-options'],
        xXssProtection: !!responseHeaders['x-xss-protection'],
        referrerPolicy: !!responseHeaders['referrer-policy'],
      };

      // Mixed content detection
      const httpResources = html.match(/(?:src|href)=["']http:\/\/[^"']+["']/gi) || [];
      const hasMixedContent = isHttps && httpResources.length > 0;

      // Social media detection
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

      const socialProfiles = socialPlatforms.map(({ platform, patterns }) => {
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

      // Build comprehensive checks
      type CheckStatus = "pass" | "warning" | "fail";
      type Check = { name: string; status: CheckStatus; message: string; recommendation?: string; category: string; priority: "high" | "medium" | "low" };
      const checks: Check[] = [];

      // ===== SEO CHECKS =====
      // Title
      if (!title) {
        checks.push({ name: "Page Title", status: "fail", message: "No title tag found", recommendation: "Add a descriptive title tag (50-60 characters)", category: "seo", priority: "high" });
      } else if (title.length < 30) {
        checks.push({ name: "Page Title", status: "warning", message: `Title is short (${title.length} chars)`, recommendation: "Consider a longer title (50-60 characters)", category: "seo", priority: "medium" });
      } else if (title.length > 70) {
        checks.push({ name: "Page Title", status: "warning", message: `Title is long (${title.length} chars)`, recommendation: "Keep title under 60 characters", category: "seo", priority: "low" });
      } else {
        checks.push({ name: "Page Title", status: "pass", message: `Good title length (${title.length} chars)`, category: "seo", priority: "high" });
      }

      // Meta Description
      if (!description) {
        checks.push({ name: "Meta Description", status: "fail", message: "No meta description found", recommendation: "Add a meta description (150-160 characters)", category: "seo", priority: "high" });
      } else if (description.length < 100) {
        checks.push({ name: "Meta Description", status: "warning", message: `Description is short (${description.length} chars)`, recommendation: "Expand to 150-160 characters", category: "seo", priority: "medium" });
      } else if (description.length > 170) {
        checks.push({ name: "Meta Description", status: "warning", message: `Description may be truncated (${description.length} chars)`, recommendation: "Keep under 160 characters", category: "seo", priority: "low" });
      } else {
        checks.push({ name: "Meta Description", status: "pass", message: `Good description length (${description.length} chars)`, category: "seo", priority: "high" });
      }

      // Heading Hierarchy
      if (headingCounts.h1 === 0) {
        checks.push({ name: "H1 Heading", status: "fail", message: "No H1 heading found", recommendation: "Add one H1 heading with your main keyword", category: "seo", priority: "high" });
      } else if (headingCounts.h1 > 1) {
        checks.push({ name: "H1 Heading", status: "warning", message: `Multiple H1s found (${headingCounts.h1})`, recommendation: "Use only one H1 per page", category: "seo", priority: "medium" });
      } else {
        checks.push({ name: "H1 Heading", status: "pass", message: "Single H1 heading found", category: "seo", priority: "high" });
      }

      // Heading structure
      const totalHeadings = Object.values(headingCounts).reduce((a, b) => a + b, 0);
      if (totalHeadings < 3) {
        checks.push({ name: "Heading Structure", status: "warning", message: `Only ${totalHeadings} headings found`, recommendation: "Use more headings to structure content", category: "seo", priority: "medium" });
      } else {
        checks.push({ name: "Heading Structure", status: "pass", message: `Good heading structure (${totalHeadings} headings)`, category: "seo", priority: "medium" });
      }

      // Keywords Meta
      if (keywords) {
        checks.push({ name: "Meta Keywords", status: "pass", message: "Keywords meta tag present", category: "seo", priority: "low" });
      }

      // Images
      if (imgMatches.length === 0) {
        checks.push({ name: "Image Alt Tags", status: "pass", message: "No images to check", category: "seo", priority: "medium" });
      } else if (imgsWithAlt < imgMatches.length) {
        const missing = imgMatches.length - imgsWithAlt - imgsWithEmptyAlt;
        checks.push({ name: "Image Alt Tags", status: missing > 0 ? "warning" : "pass", message: `${imgsWithAlt}/${imgMatches.length} images have alt text`, recommendation: missing > 0 ? "Add descriptive alt text to all images" : undefined, category: "seo", priority: "medium" });
      } else {
        checks.push({ name: "Image Alt Tags", status: "pass", message: `All ${imgMatches.length} images have alt text`, category: "seo", priority: "medium" });
      }

      // Canonical
      if (hasCanonical) {
        checks.push({ name: "Canonical URL", status: "pass", message: "Canonical link present", category: "seo", priority: "medium" });
      } else {
        checks.push({ name: "Canonical URL", status: "warning", message: "No canonical URL specified", recommendation: "Add canonical link to prevent duplicate content", category: "seo", priority: "medium" });
      }

      // Robots.txt
      if (hasRobotsTxt) {
        checks.push({ name: "Robots.txt", status: "pass", message: "robots.txt file found", category: "seo", priority: "medium" });
      } else {
        checks.push({ name: "Robots.txt", status: "warning", message: "No robots.txt file found", recommendation: "Add robots.txt to control crawler access", category: "seo", priority: "low" });
      }

      // Sitemap
      if (hasSitemapXml) {
        checks.push({ name: "XML Sitemap", status: "pass", message: "sitemap.xml found", category: "seo", priority: "medium" });
      } else if (robotsTxtContent.toLowerCase().includes("sitemap:")) {
        checks.push({ name: "XML Sitemap", status: "pass", message: "Sitemap referenced in robots.txt", category: "seo", priority: "medium" });
      } else {
        checks.push({ name: "XML Sitemap", status: "warning", message: "No sitemap.xml found", recommendation: "Add an XML sitemap for better indexing", category: "seo", priority: "medium" });
      }

      // Structured Data
      if (hasJsonLd || hasMicrodata) {
        checks.push({ name: "Structured Data", status: "pass", message: hasJsonLd ? "JSON-LD structured data found" : "Microdata found", category: "seo", priority: "medium" });
      } else {
        checks.push({ name: "Structured Data", status: "warning", message: "No structured data found", recommendation: "Add Schema.org markup for rich snippets", category: "seo", priority: "low" });
      }

      // Links
      checks.push({ name: "Internal Links", status: internalLinks.length >= 3 ? "pass" : "warning", message: `${internalLinks.length} internal links found`, recommendation: internalLinks.length < 3 ? "Add more internal links for better navigation" : undefined, category: "seo", priority: "low" });
      checks.push({ name: "External Links", status: "pass", message: `${externalLinks.length} external links found`, category: "seo", priority: "low" });

      // ===== PERFORMANCE CHECKS =====
      // Page Size
      const pageSizeKB = Math.round(contentLength / 1024);
      if (pageSizeKB > 500) {
        checks.push({ name: "Page Size", status: "warning", message: `Page is ${pageSizeKB}KB`, recommendation: "Consider reducing page size for faster loading", category: "performance", priority: "high" });
      } else if (pageSizeKB > 200) {
        checks.push({ name: "Page Size", status: "pass", message: `Page is ${pageSizeKB}KB`, category: "performance", priority: "high" });
      } else {
        checks.push({ name: "Page Size", status: "pass", message: `Excellent page size (${pageSizeKB}KB)`, category: "performance", priority: "high" });
      }

      // Response Time
      if (responseTime > 3000) {
        checks.push({ name: "Response Time", status: "fail", message: `Slow response (${responseTime}ms)`, recommendation: "Optimize server response time", category: "performance", priority: "high" });
      } else if (responseTime > 1500) {
        checks.push({ name: "Response Time", status: "warning", message: `Response time ${responseTime}ms`, recommendation: "Consider optimizing server performance", category: "performance", priority: "medium" });
      } else {
        checks.push({ name: "Response Time", status: "pass", message: `Fast response (${responseTime}ms)`, category: "performance", priority: "high" });
      }

      // Scripts
      if (scriptTags > 15) {
        checks.push({ name: "JavaScript Files", status: "warning", message: `${scriptTags} script tags found`, recommendation: "Consider bundling scripts", category: "performance", priority: "medium" });
      } else {
        checks.push({ name: "JavaScript Files", status: "pass", message: `${scriptTags} script tags`, category: "performance", priority: "medium" });
      }

      // CSS
      if (stylesheetLinks + inlineStyles > 10) {
        checks.push({ name: "CSS Files", status: "warning", message: `${stylesheetLinks} stylesheets, ${inlineStyles} inline styles`, recommendation: "Consider bundling CSS files", category: "performance", priority: "medium" });
      } else {
        checks.push({ name: "CSS Files", status: "pass", message: `${stylesheetLinks} stylesheets`, category: "performance", priority: "medium" });
      }

      // Images count
      if (imgMatches.length > 30) {
        checks.push({ name: "Image Count", status: "warning", message: `${imgMatches.length} images on page`, recommendation: "Consider lazy loading images", category: "performance", priority: "medium" });
      } else {
        checks.push({ name: "Image Count", status: "pass", message: `${imgMatches.length} images`, category: "performance", priority: "low" });
      }

      // ===== SECURITY CHECKS =====
      // HTTPS
      if (isHttps) {
        checks.push({ name: "HTTPS", status: "pass", message: "Site uses HTTPS", category: "security", priority: "high" });
      } else {
        checks.push({ name: "HTTPS", status: "fail", message: "Site does not use HTTPS", recommendation: "Enable SSL/TLS certificate", category: "security", priority: "high" });
      }

      // HSTS
      if (securityHeaders.hsts) {
        checks.push({ name: "HSTS Header", status: "pass", message: "Strict-Transport-Security enabled", category: "security", priority: "medium" });
      } else if (isHttps) {
        checks.push({ name: "HSTS Header", status: "warning", message: "HSTS header not set", recommendation: "Enable HSTS for better security", category: "security", priority: "medium" });
      }

      // CSP
      if (securityHeaders.csp) {
        checks.push({ name: "Content Security Policy", status: "pass", message: "CSP header present", category: "security", priority: "medium" });
      } else {
        checks.push({ name: "Content Security Policy", status: "warning", message: "No CSP header", recommendation: "Add Content-Security-Policy header", category: "security", priority: "low" });
      }

      // X-Frame-Options
      if (securityHeaders.xFrameOptions) {
        checks.push({ name: "X-Frame-Options", status: "pass", message: "Clickjacking protection enabled", category: "security", priority: "medium" });
      } else {
        checks.push({ name: "X-Frame-Options", status: "warning", message: "No X-Frame-Options header", recommendation: "Add X-Frame-Options to prevent clickjacking", category: "security", priority: "low" });
      }

      // X-Content-Type-Options
      if (securityHeaders.xContentTypeOptions) {
        checks.push({ name: "X-Content-Type-Options", status: "pass", message: "MIME sniffing protection enabled", category: "security", priority: "low" });
      }

      // Mixed Content
      if (hasMixedContent) {
        checks.push({ name: "Mixed Content", status: "fail", message: `${httpResources.length} HTTP resources on HTTPS page`, recommendation: "Update all resources to use HTTPS", category: "security", priority: "high" });
      } else if (isHttps) {
        checks.push({ name: "Mixed Content", status: "pass", message: "No mixed content detected", category: "security", priority: "high" });
      }

      // ===== USABILITY CHECKS =====
      // Viewport
      if (hasViewport) {
        checks.push({ name: "Mobile Viewport", status: "pass", message: "Viewport meta tag present", category: "usability", priority: "high" });
      } else {
        checks.push({ name: "Mobile Viewport", status: "fail", message: "No viewport meta tag", recommendation: "Add viewport for mobile responsiveness", category: "usability", priority: "high" });
      }

      // Language
      if (hasLangAttr) {
        checks.push({ name: "Language Attribute", status: "pass", message: "HTML lang attribute set", category: "usability", priority: "medium" });
      } else {
        checks.push({ name: "Language Attribute", status: "warning", message: "No lang attribute on HTML", recommendation: "Add lang attribute for accessibility", category: "usability", priority: "medium" });
      }

      // Charset
      if (hasCharset) {
        checks.push({ name: "Character Encoding", status: "pass", message: "Charset defined", category: "usability", priority: "medium" });
      } else {
        checks.push({ name: "Character Encoding", status: "warning", message: "No charset meta tag", recommendation: "Add charset meta tag", category: "usability", priority: "low" });
      }

      // Favicon
      if (favicon) {
        checks.push({ name: "Favicon", status: "pass", message: "Favicon present", category: "usability", priority: "low" });
      } else {
        checks.push({ name: "Favicon", status: "warning", message: "No favicon found", recommendation: "Add a favicon for browser tabs", category: "usability", priority: "low" });
      }

      // Form Labels
      if (formInputs.length > 0) {
        const labelRatio = inputsWithLabels / formInputs.length;
        if (labelRatio < 0.5) {
          checks.push({ name: "Form Labels", status: "warning", message: `${inputsWithLabels}/${formInputs.length} inputs have labels`, recommendation: "Add labels to form inputs for accessibility", category: "usability", priority: "medium" });
        } else {
          checks.push({ name: "Form Labels", status: "pass", message: "Form inputs have associated labels", category: "usability", priority: "medium" });
        }
      }

      // ===== SOCIAL CHECKS =====
      // Open Graph
      const ogComplete = ogTitle && ogDesc && ogImage && ogType && ogUrl;
      const ogPartial = ogTitle || ogDesc || ogImage;
      if (ogComplete) {
        checks.push({ name: "Open Graph Tags", status: "pass", message: "Complete Open Graph implementation", category: "social", priority: "high" });
      } else if (ogPartial) {
        checks.push({ name: "Open Graph Tags", status: "warning", message: "Partial Open Graph implementation", recommendation: "Add og:title, og:description, og:image, og:type, og:url", category: "social", priority: "medium" });
      } else {
        checks.push({ name: "Open Graph Tags", status: "fail", message: "No Open Graph tags found", recommendation: "Add OG tags for better social sharing", category: "social", priority: "high" });
      }

      // Twitter Cards
      if (twitterCard && twitterImage) {
        checks.push({ name: "Twitter Cards", status: "pass", message: `Twitter Card type: ${twitterCard}`, category: "social", priority: "medium" });
      } else if (twitterCard) {
        checks.push({ name: "Twitter Cards", status: "warning", message: "Twitter Card partially configured", recommendation: "Add twitter:image for better previews", category: "social", priority: "low" });
      } else {
        checks.push({ name: "Twitter Cards", status: "warning", message: "No Twitter Card tags", recommendation: "Add Twitter Card meta tags", category: "social", priority: "low" });
      }

      // Social Links
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

      // Calculate scores per category
      const calculateCategoryScore = (category: string) => {
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
      };

      const seoScore = calculateCategoryScore("seo");
      const performanceScore = calculateCategoryScore("performance");
      const securityScore = calculateCategoryScore("security");
      const usabilityScore = calculateCategoryScore("usability");
      const socialScore = calculateCategoryScore("social");

      const overallScore = Math.round(
        (seoScore * 0.30) + 
        (performanceScore * 0.20) + 
        (securityScore * 0.20) + 
        (usabilityScore * 0.15) + 
        (socialScore * 0.15)
      );

      const getGrade = (score: number): string => {
        if (score >= 90) return "A";
        if (score >= 80) return "B+";
        if (score >= 70) return "B";
        if (score >= 60) return "C";
        if (score >= 50) return "D";
        return "F";
      };

      // Generate prioritized recommendations
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

      res.json({
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
      });
    } catch (error: any) {
      console.error("Website audit error:", error);
      res.status(500).json({ error: "Failed to audit website", message: error.message });
    }
  });

  // ============= ANALYTICS ENDPOINTS =============

  // Helper function to hash IP for privacy
  function hashIP(ip: string): string {
    return crypto.createHash('sha256').update(ip + 'tymflo-salt').digest('hex').substring(0, 16);
  }

  // Track page view
  app.post("/api/analytics/track", async (req, res) => {
    try {
      const { path, referrer, sessionId } = req.body;
      
      if (!path) {
        return res.status(400).json({ error: "Path is required" });
      }

      // Get and hash IP
      const forwarded = req.headers['x-forwarded-for'];
      const ip = forwarded 
        ? (typeof forwarded === 'string' ? forwarded.split(',')[0] : forwarded[0])
        : req.socket.remoteAddress || '';
      const ipHash = hashIP(ip);

      await storage.recordPageView({
        path,
        referrer: referrer || null,
        userAgent: req.headers['user-agent'] || null,
        ipHash,
        sessionId: sessionId || null,
      });

      res.json({ success: true });
    } catch (error) {
      console.error("Analytics track error:", error);
      res.status(500).json({ error: "Failed to track page view" });
    }
  });

  // Admin password verification
  app.post("/api/admin/login", async (req, res) => {
    try {
      const { password } = req.body;
      
      if (!password) {
        return res.status(400).json({ error: "Password is required" });
      }

      const storedHash = await storage.getAdminSetting('admin_password_hash');
      
      // If no password set, check if this is the first setup
      if (!storedHash) {
        return res.status(403).json({ 
          error: "Admin password not set", 
          needsSetup: true 
        });
      }

      // Verify password
      const inputHash = crypto.createHash('sha256').update(password).digest('hex');
      
      if (inputHash !== storedHash) {
        return res.status(401).json({ error: "Invalid password" });
      }

      // Generate a session token
      const token = crypto.randomBytes(32).toString('hex');
      const expiry = Date.now() + (24 * 60 * 60 * 1000); // 24 hours
      
      await storage.setAdminSetting('admin_token', token);
      await storage.setAdminSetting('admin_token_expiry', expiry.toString());

      res.json({ success: true, token });
    } catch (error) {
      console.error("Admin login error:", error);
      res.status(500).json({ error: "Failed to authenticate" });
    }
  });

  // Set admin password (first time setup)
  app.post("/api/admin/setup", async (req, res) => {
    try {
      const { password } = req.body;
      
      if (!password || password.length < 6) {
        return res.status(400).json({ error: "Password must be at least 6 characters" });
      }

      // Check if password already exists
      const existingHash = await storage.getAdminSetting('admin_password_hash');
      if (existingHash) {
        return res.status(403).json({ error: "Admin password already set" });
      }

      // Hash and store password
      const hash = crypto.createHash('sha256').update(password).digest('hex');
      await storage.setAdminSetting('admin_password_hash', hash);

      // Generate session token
      const token = crypto.randomBytes(32).toString('hex');
      const expiry = Date.now() + (24 * 60 * 60 * 1000);
      
      await storage.setAdminSetting('admin_token', token);
      await storage.setAdminSetting('admin_token_expiry', expiry.toString());

      res.json({ success: true, token });
    } catch (error) {
      console.error("Admin setup error:", error);
      res.status(500).json({ error: "Failed to setup admin password" });
    }
  });

  // Get analytics data (protected)
  app.get("/api/admin/analytics", async (req, res) => {
    try {
      const authHeader = req.headers.authorization;
      const token = authHeader?.replace('Bearer ', '');
      
      if (!token) {
        return res.status(401).json({ error: "No token provided" });
      }

      const storedToken = await storage.getAdminSetting('admin_token');
      const tokenExpiry = await storage.getAdminSetting('admin_token_expiry');

      if (!storedToken || token !== storedToken) {
        return res.status(401).json({ error: "Invalid token" });
      }

      if (tokenExpiry && Date.now() > parseInt(tokenExpiry)) {
        return res.status(401).json({ error: "Token expired" });
      }

      const days = parseInt(req.query.days as string) || 30;
      const stats = await storage.getPageViewStats(days);

      res.json(stats);
    } catch (error) {
      console.error("Analytics fetch error:", error);
      res.status(500).json({ error: "Failed to fetch analytics" });
    }
  });

  // Check if admin setup is needed
  app.get("/api/admin/status", async (_req, res) => {
    try {
      const hasPassword = await storage.getAdminSetting('admin_password_hash');
      res.json({ needsSetup: !hasPassword });
    } catch (error) {
      console.error("Admin status error:", error);
      res.status(500).json({ error: "Failed to check admin status" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
