import { useState, useRef } from "react";
import { QRCodeSVG } from "qrcode.react";
import {
  Smartphone,
  Download,
  Copy,
  Check,
  Apple,
  Play,
} from "lucide-react";
import { SiGoogleplay, SiAmazon } from "react-icons/si";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import SEO from "@/components/SEO";
import { HowItWorks, Features, FAQSection } from "@/components/SEOContent";

interface AppInfo {
  name: string;
  developer: string;
  description: string;
  appStoreUrl: string;
  playStoreUrl: string;
  amazonUrl: string;
  learnMoreUrl: string;
}

const colorSchemes = [
  { primary: "#6594FF", secondary: "#FFFFFF", name: "Blue" },
  { primary: "#9CA3AF", secondary: "#1F2937", name: "Gray" },
  { primary: "#FBBF24", secondary: "#92400E", name: "Amber" },
  { primary: "#3B82F6", secondary: "#1E40AF", name: "Royal Blue" },
  { primary: "#8B5CF6", secondary: "#FFFFFF", name: "Purple" },
  { primary: "#10B981", secondary: "#FFFFFF", name: "Green" },
  { primary: "#1F2937", secondary: "#F9FAFB", name: "Dark" },
  { primary: "#FBBF24", secondary: "#000000", name: "Gold" },
];

export default function AppLinkQR() {
  const [app, setApp] = useState<AppInfo>({
    name: "",
    developer: "",
    description: "",
    appStoreUrl: "",
    playStoreUrl: "",
    amazonUrl: "",
    learnMoreUrl: "",
  });
  const [primaryColor, setPrimaryColor] = useState("#6594FF");
  const [secondaryColor, setSecondaryColor] = useState("#FFFFFF");
  const [fgColor, setFgColor] = useState("#000000");
  const [bgColor, setBgColor] = useState("#FFFFFF");
  const [copied, setCopied] = useState(false);
  const qrRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const hasContent = app.name.trim() !== "" && (app.appStoreUrl || app.playStoreUrl || app.amazonUrl || app.learnMoreUrl);

  // Generate QR data - use first available store URL
  const generateQRData = () => {
    // Priority: playStoreUrl, then appStoreUrl, then amazonUrl, then learnMoreUrl
    if (app.playStoreUrl) return app.playStoreUrl;
    if (app.appStoreUrl) return app.appStoreUrl;
    if (app.amazonUrl) return app.amazonUrl;
    if (app.learnMoreUrl) return app.learnMoreUrl;
    return "";
  };

  const qrData = generateQRData();

  const updateApp = (field: keyof AppInfo, value: string) => {
    setApp((prev) => ({ ...prev, [field]: value }));
  };

  const selectColorScheme = (scheme: typeof colorSchemes[0]) => {
    setPrimaryColor(scheme.primary);
    setSecondaryColor(scheme.secondary);
  };

  const downloadQR = (format: "png" | "svg") => {
    if (!qrRef.current || !hasContent) return;

    const svg = qrRef.current.querySelector("svg");
    if (!svg) return;

    const fileName = `app-${app.name.toLowerCase().replace(/\s+/g, "-")}`;

    if (format === "svg") {
      const svgData = new XMLSerializer().serializeToString(svg);
      const blob = new Blob([svgData], { type: "image/svg+xml" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${fileName}.svg`;
      link.click();
      URL.revokeObjectURL(url);
    } else {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      canvas.width = 512;
      canvas.height = 512;

      const img = new Image();
      const svgData = new XMLSerializer().serializeToString(svg);
      const svgBlob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
      const url = URL.createObjectURL(svgBlob);

      img.onload = () => {
        ctx.fillStyle = bgColor;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        const link = document.createElement("a");
        link.download = `${fileName}.png`;
        link.href = canvas.toDataURL("image/png");
        link.click();
        URL.revokeObjectURL(url);
      };
      img.src = url;
    }

    toast({ title: "Downloaded!", description: `App QR code saved as ${format.toUpperCase()}` });
  };

  const copyToClipboard = async () => {
    if (!qrRef.current || !hasContent) return;

    const svg = qrRef.current.querySelector("svg");
    if (!svg) return;

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = 512;
    canvas.height = 512;

    const img = new Image();
    const svgData = new XMLSerializer().serializeToString(svg);
    const svgBlob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(svgBlob);

    img.onload = async () => {
      ctx.fillStyle = bgColor;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      canvas.toBlob(async (blob) => {
        if (blob) {
          try {
            if (typeof (window as any).ClipboardItem === "undefined") {
              toast({ title: "Not Supported", description: "Clipboard API not supported in this browser", variant: "destructive" });
              return;
            }
            await navigator.clipboard.write([
              new (window as any).ClipboardItem({ "image/png": blob }),
            ]);
            setCopied(true);
            toast({ title: "Copied!", description: "App QR code copied to clipboard" });
            setTimeout(() => setCopied(false), 2000);
          } catch {
            toast({ title: "Error", description: "Could not copy to clipboard", variant: "destructive" });
          }
        }
      }, "image/png");

      URL.revokeObjectURL(url);
    };
    img.src = url;
  };

  const howItWorksSteps = [
    { step: 1, title: "Enter App Details", description: "Add your app name and store links." },
    { step: 2, title: "Choose Colors", description: "Pick a color scheme that matches your brand." },
    { step: 3, title: "Share", description: "Download and share your app QR code." },
  ];

  const features = [
    { icon: <Smartphone className="w-6 h-6" />, title: "Multi-Platform", description: "Link to all major app stores." },
    { icon: <Download className="w-6 h-6" />, title: "One Scan Download", description: "Users scan and download instantly." },
    { icon: <Play className="w-6 h-6" />, title: "Promote Your App", description: "Perfect for marketing materials." },
  ];

  const faqItems = [
    { question: "Which store URL should I provide?", answer: "Provide at least one app store URL. If you have multiple, the QR will link to the primary one (Play Store preferred for widest reach)." },
    { question: "Can I link to multiple stores?", answer: "The QR code links to one URL. For multi-platform apps, consider using a smart link service that detects the user's device." },
    { question: "What if I only have an iOS app?", answer: "Just add your App Store URL - the QR will work perfectly for iPhone users." },
  ];

  return (
    <>
      <SEO
        title="App Link QR Code Generator | TymFlo Hub"
        description="Create a QR code that links to your app on the App Store, Google Play, or other app stores."
        canonical="https://tymflohub.com/tools/app-qr"
        keywords="app qr code, app store qr, google play qr, app download qr"
      />

      <div className="py-8 bg-gradient-to-br from-violet-50 to-purple-50 dark:from-violet-950/20 dark:to-purple-950/20 min-h-[calc(100vh-4rem)]">
        <div className="container mx-auto max-w-5xl px-4">
          <div className="mb-6 text-center">
            <div className="flex items-center justify-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
                <Smartphone className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-2xl font-bold">App Link QR Code</h1>
            </div>
            <p className="text-muted-foreground">
              Create a QR code that links to your app in app stores
            </p>
          </div>

          <Card className="p-6 mb-8">
            <div className="grid lg:grid-cols-2 gap-8">
              {/* Form */}
              <div className="space-y-6">
                {/* Color Scheme */}
                <div>
                  <h3 className="font-semibold mb-3">Design & Customize</h3>
                  <p className="text-sm text-muted-foreground mb-3">Choose your color scheme</p>
                  <div className="grid grid-cols-4 gap-2 mb-4">
                    {colorSchemes.map((scheme) => (
                      <button
                        key={scheme.name}
                        onClick={() => selectColorScheme(scheme)}
                        className={`flex rounded-lg overflow-hidden h-10 border-2 ${
                          primaryColor === scheme.primary ? "border-primary" : "border-transparent"
                        }`}
                        data-testid={`color-scheme-${scheme.name.toLowerCase()}`}
                      >
                        <div className="w-1/2" style={{ backgroundColor: scheme.primary }} />
                        <div className="w-1/2" style={{ backgroundColor: scheme.secondary }} />
                      </button>
                    ))}
                  </div>
                  <div className="flex gap-4">
                    <div>
                      <Label>Primary Color</Label>
                      <div className="flex gap-2 items-center">
                        <input
                          type="color"
                          value={primaryColor}
                          onChange={(e) => setPrimaryColor(e.target.value)}
                          className="w-10 h-10 rounded cursor-pointer"
                          data-testid="input-primary-color"
                        />
                        <Input
                          value={primaryColor}
                          onChange={(e) => setPrimaryColor(e.target.value)}
                          className="w-24"
                        />
                      </div>
                    </div>
                    <div>
                      <Label>Secondary Color</Label>
                      <div className="flex gap-2 items-center">
                        <input
                          type="color"
                          value={secondaryColor}
                          onChange={(e) => setSecondaryColor(e.target.value)}
                          className="w-10 h-10 rounded cursor-pointer"
                          data-testid="input-secondary-color"
                        />
                        <Input
                          value={secondaryColor}
                          onChange={(e) => setSecondaryColor(e.target.value)}
                          className="w-24"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* App Information */}
                <div>
                  <h3 className="font-semibold mb-4 flex items-center gap-2">
                    <Smartphone className="w-4 h-4" />
                    App Information
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="name">App Name *</Label>
                      <Input
                        id="name"
                        value={app.name}
                        onChange={(e) => updateApp("name", e.target.value)}
                        placeholder="e.g. Cinema App"
                        data-testid="input-app-name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="developer">Developer/Company</Label>
                      <Input
                        id="developer"
                        value={app.developer}
                        onChange={(e) => updateApp("developer", e.target.value)}
                        placeholder="e.g. United Cinemas"
                        data-testid="input-developer"
                      />
                    </div>
                    <div>
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        value={app.description}
                        onChange={(e) => updateApp("description", e.target.value)}
                        placeholder="Purchase movie tickets online..."
                        rows={2}
                        data-testid="input-app-description"
                      />
                    </div>
                    <div>
                      <Label htmlFor="learnMoreUrl">Website URL</Label>
                      <Input
                        id="learnMoreUrl"
                        value={app.learnMoreUrl}
                        onChange={(e) => updateApp("learnMoreUrl", e.target.value)}
                        placeholder="https://example.com"
                        data-testid="input-learn-more"
                      />
                    </div>
                  </div>
                </div>

                {/* Store Links */}
                <div>
                  <h3 className="font-semibold mb-4">App Store Links</h3>
                  <div className="space-y-3">
                    <div>
                      <Label htmlFor="appStore" className="flex items-center gap-2">
                        <Apple className="w-4 h-4" />
                        App Store URL
                      </Label>
                      <Input
                        id="appStore"
                        value={app.appStoreUrl}
                        onChange={(e) => updateApp("appStoreUrl", e.target.value)}
                        placeholder="https://apps.apple.com/app/..."
                        data-testid="input-app-store"
                      />
                    </div>
                    <div>
                      <Label htmlFor="playStore" className="flex items-center gap-2">
                        <SiGoogleplay className="w-4 h-4" />
                        Google Play URL
                      </Label>
                      <Input
                        id="playStore"
                        value={app.playStoreUrl}
                        onChange={(e) => updateApp("playStoreUrl", e.target.value)}
                        placeholder="https://play.google.com/store/apps/..."
                        data-testid="input-play-store"
                      />
                    </div>
                    <div>
                      <Label htmlFor="amazon" className="flex items-center gap-2">
                        <SiAmazon className="w-4 h-4" />
                        Amazon Appstore URL
                      </Label>
                      <Input
                        id="amazon"
                        value={app.amazonUrl}
                        onChange={(e) => updateApp("amazonUrl", e.target.value)}
                        placeholder="https://www.amazon.com/dp/..."
                        data-testid="input-amazon"
                      />
                    </div>
                  </div>
                </div>

                {/* QR Code Colors */}
                <div>
                  <h3 className="font-semibold mb-3">QR Code Colors</h3>
                  <div className="flex gap-4">
                    <div>
                      <Label htmlFor="fgColor">Foreground</Label>
                      <div className="flex gap-2 items-center">
                        <input
                          type="color"
                          id="fgColor"
                          value={fgColor}
                          onChange={(e) => setFgColor(e.target.value)}
                          className="w-10 h-10 rounded cursor-pointer"
                          data-testid="input-fg-color"
                        />
                        <Input
                          value={fgColor}
                          onChange={(e) => setFgColor(e.target.value)}
                          className="w-24"
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="bgColor">Background</Label>
                      <div className="flex gap-2 items-center">
                        <input
                          type="color"
                          id="bgColor"
                          value={bgColor}
                          onChange={(e) => setBgColor(e.target.value)}
                          className="w-10 h-10 rounded cursor-pointer"
                          data-testid="input-bg-color"
                        />
                        <Input
                          value={bgColor}
                          onChange={(e) => setBgColor(e.target.value)}
                          className="w-24"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Preview Panel */}
              <div className="flex flex-col items-center">
                {/* Phone Mockup */}
                <div className="relative mb-6">
                  <div className="w-[280px] bg-gray-800 rounded-[40px] p-3 shadow-2xl">
                    <div className="bg-gray-900 rounded-[32px] overflow-hidden">
                      {/* Status Bar */}
                      <div className="text-white text-xs flex justify-between px-6 py-2" style={{ backgroundColor: primaryColor }}>
                        <span>18:45</span>
                        <div className="flex gap-1 items-center">
                          <span>5G</span>
                          <div className="w-6 h-3 border border-white rounded-sm">
                            <div className="w-4 h-full bg-white rounded-sm" />
                          </div>
                        </div>
                      </div>

                      {/* App Preview */}
                      <div className="min-h-[420px]" style={{ backgroundColor: primaryColor }}>
                        {/* App Icon */}
                        <div className="flex justify-center pt-8 pb-4">
                          <div
                            className="w-20 h-20 rounded-2xl flex items-center justify-center shadow-lg"
                            style={{ backgroundColor: secondaryColor }}
                          >
                            <Smartphone className="w-10 h-10" style={{ color: primaryColor }} />
                          </div>
                        </div>

                        {/* App Info */}
                        <div className="text-center px-6 pb-4">
                          <h3 className="text-xl font-bold" style={{ color: secondaryColor }}>
                            {app.name || "App Name"}
                          </h3>
                          {app.developer && (
                            <p className="text-sm opacity-80" style={{ color: secondaryColor }}>
                              {app.developer}
                            </p>
                          )}
                          {app.description && (
                            <p className="text-sm mt-2 opacity-70 line-clamp-2" style={{ color: secondaryColor }}>
                              {app.description}
                            </p>
                          )}
                        </div>

                        {/* Learn More Button */}
                        {app.learnMoreUrl && (
                          <div className="px-6 mb-4">
                            <button
                              className="w-full py-3 rounded-lg font-medium"
                              style={{ backgroundColor: secondaryColor, color: primaryColor }}
                            >
                              Learn more
                            </button>
                          </div>
                        )}

                        {/* Store Buttons */}
                        <div className="px-6 space-y-2 pb-6">
                          {app.appStoreUrl && (
                            <div className="flex items-center gap-3 bg-black/90 text-white py-2 px-4 rounded-lg">
                              <Apple className="w-6 h-6" />
                              <div className="text-left">
                                <div className="text-[10px] opacity-80">Available on the</div>
                                <div className="text-sm font-semibold">App Store</div>
                              </div>
                            </div>
                          )}
                          {app.playStoreUrl && (
                            <div className="flex items-center gap-3 bg-black/90 text-white py-2 px-4 rounded-lg">
                              <SiGoogleplay className="w-5 h-5" />
                              <div className="text-left">
                                <div className="text-[10px] opacity-80">GET IT ON</div>
                                <div className="text-sm font-semibold">Google Play</div>
                              </div>
                            </div>
                          )}
                          {app.amazonUrl && (
                            <div className="flex items-center gap-3 bg-black/90 text-white py-2 px-4 rounded-lg">
                              <SiAmazon className="w-5 h-5" />
                              <div className="text-left">
                                <div className="text-[10px] opacity-80">available at</div>
                                <div className="text-sm font-semibold">Amazon Appstore</div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* QR Code */}
                <div
                  ref={qrRef}
                  className="p-6 rounded-xl shadow-lg mb-4"
                  style={{ backgroundColor: bgColor }}
                  data-testid="qr-preview"
                >
                  {hasContent ? (
                    <QRCodeSVG
                      value={qrData}
                      size={180}
                      fgColor={fgColor}
                      bgColor={bgColor}
                      level="M"
                    />
                  ) : (
                    <div className="w-[180px] h-[180px] flex items-center justify-center border-2 border-dashed rounded-lg">
                      <p className="text-muted-foreground text-center px-4 text-sm">
                        Enter app name and store URL to generate QR
                      </p>
                    </div>
                  )}
                </div>

                {hasContent && (
                  <div className="flex gap-2 flex-wrap justify-center">
                    <Button onClick={() => downloadQR("png")} data-testid="button-download-png">
                      <Download className="w-4 h-4 mr-2" />
                      PNG
                    </Button>
                    <Button variant="outline" onClick={() => downloadQR("svg")} data-testid="button-download-svg">
                      <Download className="w-4 h-4 mr-2" />
                      SVG
                    </Button>
                    <Button variant="outline" onClick={copyToClipboard} data-testid="button-copy">
                      {copied ? <Check className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
                      {copied ? "Copied" : "Copy"}
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </Card>

          <HowItWorks title="How It Works" steps={howItWorksSteps} />
          <Features title="Features" features={features} />
          <FAQSection title="Frequently Asked Questions" faqs={faqItems} />
        </div>
      </div>
    </>
  );
}
