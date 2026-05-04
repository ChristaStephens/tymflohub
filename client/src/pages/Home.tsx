import { useState, useMemo, useEffect } from "react";
import { useLocation } from "wouter";
import { 
  Calculator, FileText, Image as ImageIcon, Clock, DollarSign, TrendingUp, 
  BarChart3, Globe, Users, Shield, Zap, FileSpreadsheet, FileType,
  Scissors, RotateCw, Trash2, FileOutput, FileInput, Percent, Split,
  Wallet, PiggyBank, TrendingDown, ArrowLeftRight, Ruler, Thermometer,
  BarChart2, Sigma, PenLine
} from "lucide-react";
import { Check } from "lucide-react";
import ToolCard from "@/components/ToolCard";
import SearchWithDropdown from "@/components/SearchWithDropdown";
import SEO from "@/components/SEO";

const allTools = [
  // ============ PDF TOOLS - ORGANIZE ============
  {
    title: "Merge PDF",
    description: "Combine multiple PDF files into one document in seconds.",
    icon: FileText,
    href: "/tools/pdf-merge",
    badge: "Popular" as const,
    category: "Organize PDF",
    categoryColor: "from-purple-500 to-purple-600",
  },
  {
    title: "Split PDF",
    description: "Extract pages or split large PDFs into smaller files.",
    icon: Split,
    href: "/tools/pdf-split",
    badge: "Popular" as const,
    category: "Organize PDF",
    categoryColor: "from-purple-500 to-purple-600",
  },
  {
    title: "Compress PDF",
    description: "Reduce PDF file size while maintaining quality.",
    icon: FileText,
    href: "/tools/pdf-compress",
    category: "Organize PDF",
    categoryColor: "from-purple-500 to-purple-600",
  },
  {
    title: "Rotate PDF",
    description: "Rotate PDF pages to the correct orientation.",
    icon: RotateCw,
    href: "/tools/pdf-rotate",
    category: "Organize PDF",
    categoryColor: "from-purple-500 to-purple-600",
  },
  {
    title: "Delete PDF Pages",
    description: "Remove unwanted pages from your PDF documents.",
    icon: Trash2,
    href: "/tools/pdf-delete-pages",
    category: "Organize PDF",
    categoryColor: "from-purple-500 to-purple-600",
  },
  {
    title: "Extract PDF Pages",
    description: "Extract specific pages from a PDF into a new document.",
    icon: Scissors,
    href: "/tools/pdf-extract",
    category: "Organize PDF",
    categoryColor: "from-purple-500 to-purple-600",
  },
  {
    title: "Edit PDF",
    description: "Add text, highlights, shapes, and whiteout sections to any PDF.",
    icon: PenLine,
    href: "/tools/pdf-edit",
    badge: "New" as const,
    category: "Organize PDF",
    categoryColor: "from-purple-500 to-purple-600",
  },
  {
    title: "Fill in PDF",
    description: "Fill in PDF forms — text fields, checkboxes, dropdowns and more.",
    icon: FileText,
    href: "/tools/pdf-fill",
    badge: "New" as const,
    category: "Organize PDF",
    categoryColor: "from-purple-500 to-purple-600",
  },

  // ============ PDF TOOLS - CONVERT FROM PDF ============
  {
    title: "PDF to Word",
    description: "Convert PDF files to editable Word documents.",
    icon: FileType,
    href: "/tools/pdf-to-word",
    badge: "Popular" as const,
    category: "Convert from PDF",
    categoryColor: "from-blue-500 to-blue-600",
  },
  {
    title: "PDF to Excel",
    description: "Convert PDF to Excel spreadsheets.",
    icon: FileSpreadsheet,
    href: "/tools/pdf-to-excel",
    category: "Convert from PDF",
    categoryColor: "from-blue-500 to-blue-600",
  },
  {
    title: "PDF to JPG",
    description: "Convert PDF pages to JPG images.",
    icon: ImageIcon,
    href: "/tools/pdf-to-jpg",
    category: "Convert from PDF",
    categoryColor: "from-blue-500 to-blue-600",
  },
  {
    title: "E-Sign PDF",
    description: "Sign documents electronically with draw, type, or upload.",
    icon: PenLine,
    href: "/tools/pdf-sign",
    badge: "New" as const,
    category: "Organize PDF",
    categoryColor: "from-purple-500 to-purple-600",
  },

  // ============ PDF TOOLS - CONVERT TO PDF ============
  {
    title: "Word to PDF",
    description: "Convert Word documents to PDF format.",
    icon: FileInput,
    href: "/tools/word-to-pdf",
    category: "Convert to PDF",
    categoryColor: "from-cyan-500 to-cyan-600",
  },
  {
    title: "Excel to PDF",
    description: "Convert Excel spreadsheets to PDF.",
    icon: FileSpreadsheet,
    href: "/tools/excel-to-pdf",
    category: "Convert to PDF",
    categoryColor: "from-cyan-500 to-cyan-600",
  },
  {
    title: "JPG to PDF",
    description: "Convert JPG images to PDF documents.",
    icon: ImageIcon,
    href: "/tools/jpg-to-pdf",
    badge: "Popular" as const,
    category: "Convert to PDF",
    categoryColor: "from-cyan-500 to-cyan-600",
  },

  // ============ IMAGE TOOLS ============
  {
    title: "Convert Images",
    description: "Convert between PNG, JPG, and WebP formats.",
    icon: ImageIcon,
    href: "/tools/image-convert",
    badge: "Popular" as const,
    category: "Image Tools",
    categoryColor: "from-orange-500 to-pink-500",
  },

  // ============ FINANCE CALCULATORS ============
  {
    title: "Currency Converter",
    description: "Convert between USD, EUR, GBP, and 150+ currencies.",
    icon: DollarSign,
    href: "/tools/currency-converter",
    badge: "Popular" as const,
    category: "Finance & Calculators",
    categoryColor: "from-green-500 to-emerald-600",
  },
  {
    title: "Loan Calculator",
    description: "Calculate monthly payments and total interest on loans.",
    icon: Wallet,
    href: "/tools/loan-calculator",
    category: "Finance & Calculators",
    categoryColor: "from-green-500 to-emerald-600",
  },
  {
    title: "Mortgage Calculator",
    description: "Estimate monthly mortgage payments and amortization.",
    icon: PiggyBank,
    href: "/tools/mortgage-calculator",
    category: "Finance & Calculators",
    categoryColor: "from-green-500 to-emerald-600",
  },
  {
    title: "Investment Calculator",
    description: "Calculate investment growth and returns over time.",
    icon: TrendingUp,
    href: "/tools/investment-calculator",
    category: "Finance & Calculators",
    categoryColor: "from-green-500 to-emerald-600",
  },
  {
    title: "Compound Interest",
    description: "Calculate compound interest on savings and investments.",
    icon: TrendingDown,
    href: "/tools/compound-interest",
    category: "Finance & Calculators",
    categoryColor: "from-green-500 to-emerald-600",
  },
  {
    title: "Profit Margin Calculator",
    description: "Calculate profit margins and markup percentages instantly.",
    icon: Percent,
    href: "/tools/profit-margin",
    category: "Finance & Calculators",
    categoryColor: "from-green-500 to-emerald-600",
  },
  {
    title: "ROI Calculator",
    description: "Calculate return on investment for business decisions.",
    icon: Calculator,
    href: "/tools/roi",
    category: "Finance & Calculators",
    categoryColor: "from-green-500 to-emerald-600",
  },
  {
    title: "Markup Calculator",
    description: "Determine the right markup percentage for products.",
    icon: TrendingUp,
    href: "/tools/markup",
    category: "Finance & Calculators",
    categoryColor: "from-green-500 to-emerald-600",
  },
  {
    title: "Break-Even Analysis",
    description: "Find how many units you need to sell to cover costs.",
    icon: BarChart3,
    href: "/tools/breakeven",
    category: "Finance & Calculators",
    categoryColor: "from-green-500 to-emerald-600",
  },

  // ============ STATISTICS TOOLS ============
  {
    title: "Mean, Median, Mode",
    description: "Calculate central tendency measures for your data.",
    icon: BarChart2,
    href: "/tools/mean-median-mode",
    category: "Statistics",
    categoryColor: "from-indigo-500 to-indigo-600",
  },
  {
    title: "Standard Deviation",
    description: "Calculate variance and standard deviation.",
    icon: Sigma,
    href: "/tools/standard-deviation",
    category: "Statistics",
    categoryColor: "from-indigo-500 to-indigo-600",
  },
  {
    title: "Percentage Calculator",
    description: "Calculate percentages, increases, and decreases.",
    icon: Percent,
    href: "/tools/percentage",
    badge: "Popular" as const,
    category: "Statistics",
    categoryColor: "from-indigo-500 to-indigo-600",
  },
  {
    title: "Ratio Calculator",
    description: "Calculate and simplify ratios between numbers.",
    icon: Split,
    href: "/tools/ratio",
    category: "Statistics",
    categoryColor: "from-indigo-500 to-indigo-600",
  },

  // ============ CONVERTERS ============
  {
    title: "Unit Converter",
    description: "Convert length, weight, temperature, and volume.",
    icon: Ruler,
    href: "/tools/unit-converter",
    badge: "Popular" as const,
    category: "Converters",
    categoryColor: "from-amber-500 to-amber-600",
  },
  {
    title: "Timezone Converter",
    description: "Convert times across global timezones.",
    icon: Globe,
    href: "/tools/timezone",
    category: "Converters",
    categoryColor: "from-amber-500 to-amber-600",
  },

  // ============ PRODUCTIVITY ============
  {
    title: "Pomodoro Timer",
    description: "Boost productivity with focused 25-minute sessions.",
    icon: Clock,
    href: "/tools/pomodoro",
    category: "Productivity",
    categoryColor: "from-rose-500 to-rose-600",
  },

  // ============ TEXT TOOLS ============
  {
    title: "Text Case Converter",
    description: "Convert text to UPPERCASE, lowercase, Title Case, camelCase, and more.",
    icon: FileType,
    href: "/tools/text-case",
    badge: "New" as const,
    category: "Text Tools",
    categoryColor: "from-violet-500 to-purple-600",
  },
  {
    title: "Word Counter",
    description: "Count words, characters, sentences, and estimate reading time.",
    icon: FileText,
    href: "/tools/word-counter",
    badge: "New" as const,
    category: "Text Tools",
    categoryColor: "from-emerald-500 to-teal-600",
  },
  {
    title: "Text Formatter",
    description: "Remove HTML/Markdown or add formatting to your text.",
    icon: FileText,
    href: "/tools/text-formatter",
    badge: "New" as const,
    category: "Text Tools",
    categoryColor: "from-orange-500 to-amber-600",
  },

  // ============ DESIGN TOOLS ============
  {
    title: "Color Picker",
    description: "Pick colors and convert between HEX, RGB, and HSL formats.",
    icon: ImageIcon,
    href: "/tools/color-picker",
    badge: "New" as const,
    category: "Design Tools",
    categoryColor: "from-pink-500 to-rose-600",
  },
  {
    title: "Palette Generator",
    description: "Generate beautiful color palettes with primary, secondary, and accent colors.",
    icon: ImageIcon,
    href: "/tools/palette-generator",
    badge: "New" as const,
    category: "Design Tools",
    categoryColor: "from-fuchsia-500 to-purple-600",
  },
  {
    title: "QR Code Generator",
    description: "Create branded QR codes with custom colors, logos, and design presets.",
    icon: ImageIcon,
    href: "/tools/qr-code",
    badge: "Popular" as const,
    category: "Design Tools",
    categoryColor: "from-slate-600 to-zinc-700",
  },
  {
    title: "WiFi QR Code",
    description: "Create QR codes for WiFi networks - let guests connect instantly.",
    icon: ImageIcon,
    href: "/tools/wifi-qr",
    badge: "New" as const,
    category: "Design Tools",
    categoryColor: "from-blue-500 to-cyan-600",
  },
  {
    title: "vCard QR Code",
    description: "Generate digital business cards - share contact info with a scan.",
    icon: ImageIcon,
    href: "/tools/vcard-qr",
    badge: "New" as const,
    category: "Design Tools",
    categoryColor: "from-emerald-500 to-teal-600",
  },
  {
    title: "Business Page QR",
    description: "Create a QR code with your business info, hours, and location.",
    icon: ImageIcon,
    href: "/tools/business-qr",
    badge: "New" as const,
    category: "Design Tools",
    categoryColor: "from-orange-500 to-amber-600",
  },
  {
    title: "Menu QR Code",
    description: "Create a digital restaurant menu - customers scan to view.",
    icon: ImageIcon,
    href: "/tools/menu-qr",
    badge: "New" as const,
    category: "Design Tools",
    categoryColor: "from-amber-500 to-yellow-600",
  },
  {
    title: "App Link QR Code",
    description: "Link to your app on App Store, Google Play, and more.",
    icon: ImageIcon,
    href: "/tools/app-qr",
    badge: "New" as const,
    category: "Design Tools",
    categoryColor: "from-violet-500 to-purple-600",
  },

  // ============ MARKETING TOOLS ============
  {
    title: "Presence Audit",
    description: "Analyze your website SEO, performance, security, and social media presence.",
    icon: Globe,
    href: "/tools/presence-audit",
    badge: "New" as const,
    category: "Marketing Tools",
    categoryColor: "from-teal-500 to-cyan-600",
  },
];

export default function Home() {
  const [location] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");

  // Check URL parameters for search prepopulation
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const query = params.get("q");
    if (query) {
      setSearchQuery(query);
    }
  }, [location]);

  // Filter tools based on search query
  const filteredTools = useMemo(() => {
    if (!searchQuery.trim()) {
      return allTools;
    }

    const query = searchQuery.toLowerCase();
    return allTools.filter(
      (tool) =>
        tool.title.toLowerCase().includes(query) ||
        tool.description.toLowerCase().includes(query) ||
        tool.category.toLowerCase().includes(query)
    );
  }, [searchQuery]);

  // Group tools by category for display
  const toolsByCategory = useMemo(() => {
    const categories = new Map<string, typeof allTools>();
    filteredTools.forEach((tool) => {
      const existing = categories.get(tool.category) || [];
      categories.set(tool.category, [...existing, tool]);
    });
    return categories;
  }, [filteredTools]);

  // Get most popular tools (marked with badge or first 12)
  const popularTools = useMemo(() => {
    const withBadges = allTools.filter(tool => tool.badge === "Popular");
    const withoutBadges = allTools.filter(tool => !tool.badge);
    return [...withBadges, ...withoutBadges].slice(0, 12);
  }, []);

  return (
    <>
      <SEO
        title="TymFlo Hub - Free PDF Tools, Calculators & Converters"
        description="Free online tools for PDF manipulation, currency conversion, finance calculators, and statistics. Fast, secure, and easy to use. No registration required."
        canonical="https://tymflohub.com/"
        keywords="pdf tools, pdf merge, pdf split, currency converter, profit margin calculator, business calculators, online tools, free pdf tools"
      />

      {/* Hero Section */}
      <section className="relative bg-gradient-to-b from-accent/30 to-background py-16 md:py-24">
        <div className="container mx-auto max-w-5xl px-6 text-center">
          <h1 className="text-5xl md:text-6xl font-bold tracking-tight text-primary mb-6">
            We make work easy.
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground mb-12 max-w-2xl mx-auto">
            All the tools you'll need to be more productive and work smarter<br />with documents.
          </p>

          <SearchWithDropdown
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            allTools={allTools}
          />

          <div className="flex flex-wrap justify-center items-center gap-8 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Check className="w-5 h-5 text-primary" />
              <span>No registration required</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-5 h-5 text-primary" />
              <span>Files deleted after 1 hour</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-5 h-5 text-primary" />
              <span>Secure encryption</span>
            </div>
          </div>
        </div>
      </section>

      {/* Tools Section */}
      <section className="py-16 bg-background">
        <div className="container mx-auto max-w-7xl px-6">
          {filteredTools.length > 0 ? (
            <>
              {/* Most Popular Tools */}
              <div className="mb-16">
                <h2 className="text-3xl md:text-4xl font-bold text-center text-primary mb-3">
                  Most Popular Tools
                </h2>
                <p className="text-center text-muted-foreground mb-12">
                  {allTools.length} tools to convert, calculate, and work smarter. Try it out today!
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {(searchQuery ? filteredTools.slice(0, 12) : popularTools).map((tool) => (
                    <ToolCard key={tool.href} {...tool} section="popular" />
                  ))}
                </div>
              </div>

              {/* All Tools by Category */}
              {!searchQuery && (
                <div>
                  <h2 className="text-3xl md:text-4xl font-bold text-center text-primary mb-12">
                    All Tools
                  </h2>

                  <div className="space-y-12">
                    {Array.from(toolsByCategory.entries()).map(([category, tools]) => (
                      <div key={category}>
                        <h3 className="text-2xl font-bold text-primary mb-6">{category}</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                          {tools.map((tool) => (
                            <ToolCard key={tool.href} {...tool} section="all" />
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-20">
              <p className="text-xl text-muted-foreground mb-4">
                No tools found for "{searchQuery}"
              </p>
              <p className="text-muted-foreground">
                Try a different search term or browse all our tools below
              </p>
            </div>
          )}

          {/* Trust Section */}
          <div className="mt-24 bg-gradient-to-br from-primary/5 to-accent/20 rounded-3xl p-12 md:p-16">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-primary mb-4">
                Why Choose TymFlo Hub?
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Trusted by thousands of professionals worldwide
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Shield className="w-8 h-8 text-primary" />
                </div>
                <h3 className="font-bold text-xl mb-3 text-primary">100% Secure</h3>
                <p className="text-muted-foreground">
                  Files encrypted with SSL. Auto-deleted after 1 hour. Your data stays private.
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Zap className="w-8 h-8 text-primary" />
                </div>
                <h3 className="font-bold text-xl mb-3 text-primary">Lightning Fast</h3>
                <p className="text-muted-foreground">
                  Get results in seconds with our optimized processing engine. No waiting.
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-primary" />
                </div>
                <h3 className="font-bold text-xl mb-3 text-primary">Always Free</h3>
                <p className="text-muted-foreground">
                  All tools are completely free to use. No registration, no limits, no strings attached.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
