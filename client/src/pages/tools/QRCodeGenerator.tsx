import { useState, useRef } from "react";
import { QrCode, Download, Copy, Check, Image, Palette, Square, Circle } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import SEO from "@/components/SEO";
import { HowItWorks, Features, FAQSection } from "@/components/SEOContent";

type ErrorLevel = "L" | "M" | "Q" | "H";

interface DesignPreset {
  name: string;
  fgColor: string;
  bgColor: string;
  cornerColor?: string;
  dotColor?: string;
}

const designPresets: DesignPreset[] = [
  { name: "Classic", fgColor: "#000000", bgColor: "#FFFFFF" },
  { name: "Inverted", fgColor: "#FFFFFF", bgColor: "#000000" },
  { name: "TymFlo Purple", fgColor: "#463176", bgColor: "#FFFFFF" },
  { name: "Ocean Blue", fgColor: "#0077B6", bgColor: "#CAF0F8" },
  { name: "Forest Green", fgColor: "#2D6A4F", bgColor: "#D8F3DC" },
  { name: "Sunset Orange", fgColor: "#E85D04", bgColor: "#FFEDD8" },
  { name: "Berry Pink", fgColor: "#9D4EDD", bgColor: "#F3E8FF" },
  { name: "Elegant Gold", fgColor: "#B8860B", bgColor: "#FFFEF0" },
  { name: "Modern Gray", fgColor: "#374151", bgColor: "#F3F4F6" },
  { name: "Deep Navy", fgColor: "#1E3A5F", bgColor: "#E8F4F8" },
];

const frameStyles = [
  { id: "none", name: "No Frame" },
  { id: "simple", name: "Simple Border" },
  { id: "rounded", name: "Rounded Border" },
  { id: "scan-me", name: "Scan Me" },
];

export default function QRCodeGenerator() {
  const [text, setText] = useState("https://tymflohub.com");
  const [size, setSize] = useState(256);
  const [fgColor, setFgColor] = useState("#000000");
  const [bgColor, setBgColor] = useState("#FFFFFF");
  const [errorLevel, setErrorLevel] = useState<ErrorLevel>("H");
  const [copied, setCopied] = useState(false);
  const [logoUrl, setLogoUrl] = useState("");
  const [logoSize, setLogoSize] = useState(50);
  const [frameStyle, setFrameStyle] = useState("none");
  const [cornerRadius, setCornerRadius] = useState(0);
  const qrRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const applyPreset = (preset: DesignPreset) => {
    setFgColor(preset.fgColor);
    setBgColor(preset.bgColor);
    toast({ title: "Applied!", description: `${preset.name} style applied` });
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setLogoUrl(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const downloadQR = (format: "png" | "svg") => {
    if (!qrRef.current) return;
    
    const svg = qrRef.current.querySelector("svg");
    if (!svg) return;

    if (format === "svg") {
      const svgData = new XMLSerializer().serializeToString(svg);
      const blob = new Blob([svgData], { type: "image/svg+xml" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "qrcode.svg";
      link.click();
      URL.revokeObjectURL(url);
    } else {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const exportSize = size * 2;
      canvas.width = exportSize;
      canvas.height = exportSize;

      const img = document.createElement("img");
      const svgData = new XMLSerializer().serializeToString(svg);
      const svgBlob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
      const url = URL.createObjectURL(svgBlob);

      img.onload = () => {
        ctx.fillStyle = bgColor;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        
        const link = document.createElement("a");
        link.download = "qrcode.png";
        link.href = canvas.toDataURL("image/png");
        link.click();
        URL.revokeObjectURL(url);
      };
      img.src = url;
    }

    toast({ title: "Downloaded!", description: `QR code saved as ${format.toUpperCase()}` });
  };

  const copyToClipboard = async () => {
    if (!qrRef.current) return;
    
    const svg = qrRef.current.querySelector("svg");
    if (!svg) return;

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = size * 2;
    canvas.height = size * 2;

    const img = document.createElement("img");
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
            await navigator.clipboard.write([
              new (window as any).ClipboardItem({ "image/png": blob })
            ]);
            setCopied(true);
            toast({ title: "Copied!", description: "QR code copied to clipboard" });
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
    { step: 1, title: "Enter Content", description: "Type a URL, text, or any data you want to encode." },
    { step: 2, title: "Design Your QR", description: "Choose colors, add your logo, and select a style." },
    { step: 3, title: "Download", description: "Save as PNG or SVG for print or digital use." },
  ];

  const features = [
    { icon: <Palette className="w-6 h-6" />, title: "Design Presets", description: "10+ beautiful color schemes to choose from." },
    { icon: <Image className="w-6 h-6" />, title: "Logo Support", description: "Add your brand logo to the center." },
    { icon: <Download className="w-6 h-6" />, title: "High Quality", description: "Download in PNG or SVG format." },
  ];

  const faqItems = [
    { question: "Can I add a logo to my QR code?", answer: "Yes! Upload any image as a logo. Use High error correction level (H) for best results with logos." },
    { question: "What size should my QR code be?", answer: "For print, use at least 2cm (0.8 inches). For digital, 200-300px is usually sufficient." },
    { question: "Will the colored QR code still scan?", answer: "Yes, as long as there's sufficient contrast between foreground and background colors. Darker foreground on lighter background works best." },
  ];

  return (
    <>
      <SEO
        title="QR Code Generator with Logo - Create Branded QR Codes | TymFlo Hub"
        description="Free QR code generator with logo support. Create custom branded QR codes with your colors and design. Download as PNG or SVG."
        canonical="https://tymflohub.com/tools/qr-code"
        keywords="qr code generator, qr code with logo, branded qr code, custom qr code"
      />

      <div className="py-8 bg-gradient-to-br from-slate-50 to-zinc-50 dark:from-slate-950/20 dark:to-zinc-950/20 min-h-[calc(100vh-4rem)]">
        <div className="container mx-auto max-w-5xl px-4">
          <div className="mb-6 text-center">
            <div className="flex items-center justify-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-slate-700 to-zinc-800 flex items-center justify-center">
                <QrCode className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-2xl font-bold">QR Code Generator</h1>
            </div>
            <p className="text-muted-foreground">
              Create branded QR codes with custom colors and logos
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8 mb-8">
            {/* Preview */}
            <Card className="p-6">
              <div className="flex flex-col items-center">
                <div
                  ref={qrRef}
                  className="p-6 rounded-xl shadow-lg mb-4"
                  style={{ 
                    backgroundColor: bgColor,
                    borderRadius: `${cornerRadius}px`,
                  }}
                  data-testid="qr-preview"
                >
                  <QRCodeSVG
                    value={text || "https://tymflohub.com"}
                    size={size}
                    fgColor={fgColor}
                    bgColor={bgColor}
                    level={errorLevel}
                    imageSettings={logoUrl ? {
                      src: logoUrl,
                      height: logoSize,
                      width: logoSize,
                      excavate: true,
                    } : undefined}
                  />
                </div>

                {/* Frame with text */}
                {frameStyle === "scan-me" && (
                  <div className="text-center mb-4">
                    <span className="px-4 py-2 bg-primary text-primary-foreground rounded-full text-sm font-medium">
                      SCAN ME
                    </span>
                  </div>
                )}

                {/* Download Buttons */}
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
              </div>
            </Card>

            {/* Controls */}
            <Card className="p-6">
              <Tabs defaultValue="content" className="w-full">
                <TabsList className="grid w-full grid-cols-3 mb-4">
                  <TabsTrigger value="content" data-testid="tab-content">Content</TabsTrigger>
                  <TabsTrigger value="design" data-testid="tab-design">Design</TabsTrigger>
                  <TabsTrigger value="logo" data-testid="tab-logo">Logo</TabsTrigger>
                </TabsList>

                <TabsContent value="content" className="space-y-5">
                  {/* Content */}
                  <div>
                    <Label htmlFor="qr-content" className="mb-2 block">Content (URL or text)</Label>
                    <Input
                      id="qr-content"
                      value={text}
                      onChange={(e) => setText(e.target.value)}
                      placeholder="Enter URL or text..."
                      data-testid="input-content"
                    />
                  </div>

                  {/* Size */}
                  <div>
                    <Label className="mb-2 block">Size: {size}px</Label>
                    <Slider
                      value={[size]}
                      onValueChange={(v) => setSize(v[0])}
                      min={128}
                      max={512}
                      step={32}
                      data-testid="slider-size"
                    />
                  </div>

                  {/* Error Correction */}
                  <div>
                    <Label className="mb-2 block">Error Correction Level</Label>
                    <Select value={errorLevel} onValueChange={(v) => setErrorLevel(v as ErrorLevel)}>
                      <SelectTrigger data-testid="select-error-level">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="L">Low (7%)</SelectItem>
                        <SelectItem value="M">Medium (15%)</SelectItem>
                        <SelectItem value="Q">Quartile (25%)</SelectItem>
                        <SelectItem value="H">High (30%) - Best for logos</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </TabsContent>

                <TabsContent value="design" className="space-y-5">
                  {/* Design Presets */}
                  <div>
                    <Label className="mb-2 block">Design Presets</Label>
                    <div className="grid grid-cols-2 gap-2">
                      {designPresets.map((preset) => (
                        <Button
                          key={preset.name}
                          variant="outline"
                          size="sm"
                          className="justify-start gap-2"
                          onClick={() => applyPreset(preset)}
                          data-testid={`preset-${preset.name.toLowerCase().replace(/\s+/g, "-")}`}
                        >
                          <div className="flex gap-1">
                            <div
                              className="w-4 h-4 rounded border"
                              style={{ backgroundColor: preset.fgColor }}
                            />
                            <div
                              className="w-4 h-4 rounded border"
                              style={{ backgroundColor: preset.bgColor }}
                            />
                          </div>
                          <span className="truncate">{preset.name}</span>
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* Custom Colors */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="mb-2 block">Foreground</Label>
                      <div className="flex gap-2">
                        <input
                          type="color"
                          value={fgColor}
                          onChange={(e) => setFgColor(e.target.value)}
                          className="w-10 h-10 rounded cursor-pointer border-0"
                          data-testid="input-fg-color"
                        />
                        <Input
                          value={fgColor}
                          onChange={(e) => setFgColor(e.target.value)}
                          className="font-mono uppercase"
                          maxLength={7}
                        />
                      </div>
                    </div>
                    <div>
                      <Label className="mb-2 block">Background</Label>
                      <div className="flex gap-2">
                        <input
                          type="color"
                          value={bgColor}
                          onChange={(e) => setBgColor(e.target.value)}
                          className="w-10 h-10 rounded cursor-pointer border-0"
                          data-testid="input-bg-color"
                        />
                        <Input
                          value={bgColor}
                          onChange={(e) => setBgColor(e.target.value)}
                          className="font-mono uppercase"
                          maxLength={7}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Corner Radius */}
                  <div>
                    <Label className="mb-2 block">Corner Radius: {cornerRadius}px</Label>
                    <Slider
                      value={[cornerRadius]}
                      onValueChange={(v) => setCornerRadius(v[0])}
                      min={0}
                      max={32}
                      step={4}
                    />
                  </div>
                </TabsContent>

                <TabsContent value="logo" className="space-y-5">
                  {/* Logo Upload */}
                  <div>
                    <Label className="mb-2 block">Upload Logo</Label>
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      data-testid="input-logo"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Recommended: Square image, PNG with transparent background
                    </p>
                  </div>

                  {logoUrl && (
                    <>
                      {/* Logo Size */}
                      <div>
                        <Label className="mb-2 block">Logo Size: {logoSize}px</Label>
                        <Slider
                          value={[logoSize]}
                          onValueChange={(v) => setLogoSize(v[0])}
                          min={24}
                          max={100}
                          step={4}
                        />
                      </div>

                      {/* Remove Logo */}
                      <Button
                        variant="outline"
                        onClick={() => setLogoUrl("")}
                        data-testid="button-remove-logo"
                      >
                        Remove Logo
                      </Button>
                    </>
                  )}

                  <div className="p-4 bg-muted/50 rounded-lg">
                    <p className="text-sm text-muted-foreground">
                      <strong>Tip:</strong> When using a logo, set Error Correction to "High (H)" for best scanning reliability.
                    </p>
                  </div>
                </TabsContent>
              </Tabs>
            </Card>
          </div>

          <div className="space-y-12">
            <HowItWorks title="How It Works" steps={howItWorksSteps} />
            <Features title="Features" features={features} />
            <FAQSection title="Frequently Asked Questions" faqs={faqItems} />
          </div>
        </div>
      </div>
    </>
  );
}
