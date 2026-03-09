import { useState, useRef } from "react";
import { Wifi, Download, Copy, Check, Eye, EyeOff } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import SEO from "@/components/SEO";
import { HowItWorks, Features, FAQSection } from "@/components/SEOContent";

type SecurityType = "WPA" | "WEP" | "nopass";

export default function WiFiQRCode() {
  const [ssid, setSsid] = useState("");
  const [password, setPassword] = useState("");
  const [security, setSecurity] = useState<SecurityType>("WPA");
  const [hidden, setHidden] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [copied, setCopied] = useState(false);
  const [fgColor, setFgColor] = useState("#000000");
  const [bgColor, setBgColor] = useState("#FFFFFF");
  const qrRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const generateWiFiString = () => {
    if (!ssid) return "";
    const escapedSsid = ssid.replace(/[\\;,:\"]/g, (match) => `\\${match}`);
    const escapedPassword = password.replace(/[\\;,:\"]/g, (match) => `\\${match}`);
    
    let wifiString = `WIFI:T:${security};S:${escapedSsid};`;
    if (security !== "nopass" && password) {
      wifiString += `P:${escapedPassword};`;
    }
    if (hidden) {
      wifiString += `H:true;`;
    }
    wifiString += ";";
    return wifiString;
  };

  const wifiString = generateWiFiString();

  const downloadQR = (format: "png" | "svg") => {
    if (!qrRef.current || !ssid) return;
    
    const svg = qrRef.current.querySelector("svg");
    if (!svg) return;

    if (format === "svg") {
      const svgData = new XMLSerializer().serializeToString(svg);
      const blob = new Blob([svgData], { type: "image/svg+xml" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `wifi-${ssid}.svg`;
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
        link.download = `wifi-${ssid}.png`;
        link.href = canvas.toDataURL("image/png");
        link.click();
        URL.revokeObjectURL(url);
      };
      img.src = url;
    }

    toast({ title: "Downloaded!", description: `WiFi QR code saved as ${format.toUpperCase()}` });
  };

  const copyToClipboard = async () => {
    if (!qrRef.current || !ssid) return;
    
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
              new (window as any).ClipboardItem({ "image/png": blob })
            ]);
            setCopied(true);
            toast({ title: "Copied!", description: "WiFi QR code copied to clipboard" });
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
    { step: 1, title: "Enter WiFi Details", description: "Add your network name and password." },
    { step: 2, title: "Generate QR Code", description: "The QR code updates automatically." },
    { step: 3, title: "Share", description: "Let guests scan to connect instantly." },
  ];

  const features = [
    { icon: <Wifi className="w-6 h-6" />, title: "Instant Connect", description: "Guests connect by just scanning." },
    { icon: <Download className="w-6 h-6" />, title: "Download & Print", description: "Save as PNG or SVG." },
    { icon: <Wifi className="w-6 h-6" />, title: "All Security Types", description: "WPA, WPA2, WEP, or open networks." },
  ];

  const faqItems = [
    { question: "Will this work with any phone?", answer: "Yes! Both iPhone and Android can scan WiFi QR codes with their built-in camera apps." },
    { question: "Is my password visible?", answer: "The password is encoded in the QR code but not displayed. Anyone who scans it can connect, so share responsibly." },
    { question: "What about hidden networks?", answer: "Enable the 'Hidden Network' toggle if your network doesn't broadcast its name." },
  ];

  return (
    <>
      <SEO
        title="WiFi QR Code Generator - Share WiFi Easily | TymFlo Hub"
        description="Create a QR code for your WiFi network. Let guests connect instantly by scanning - no need to type passwords."
        canonical="https://tymflohub.com/tools/wifi-qr"
        keywords="wifi qr code, wifi qr generator, share wifi, wifi password qr"
      />

      <div className="py-8 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20 min-h-[calc(100vh-4rem)]">
        <div className="container mx-auto max-w-4xl px-4">
          <div className="mb-6 text-center">
            <div className="flex items-center justify-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center">
                <Wifi className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-2xl font-bold">WiFi QR Code Generator</h1>
            </div>
            <p className="text-muted-foreground">
              Create a QR code for your WiFi - let guests connect instantly
            </p>
          </div>

          <Card className="p-6 mb-8">
            <div className="grid md:grid-cols-2 gap-8">
              {/* Preview */}
              <div className="flex flex-col items-center">
                <div
                  ref={qrRef}
                  className="p-6 rounded-xl shadow-lg mb-4"
                  style={{ backgroundColor: bgColor }}
                  data-testid="qr-preview"
                >
                  {ssid ? (
                    <QRCodeSVG
                      value={wifiString}
                      size={200}
                      fgColor={fgColor}
                      bgColor={bgColor}
                      level="M"
                    />
                  ) : (
                    <div className="w-[200px] h-[200px] flex items-center justify-center border-2 border-dashed rounded-lg">
                      <p className="text-muted-foreground text-center px-4">
                        Enter your WiFi details to generate QR code
                      </p>
                    </div>
                  )}
                </div>

                {ssid && (
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

              {/* Controls */}
              <div className="space-y-5">
                {/* Network Name */}
                <div>
                  <Label htmlFor="ssid" className="mb-2 block">Network Name (SSID)</Label>
                  <Input
                    id="ssid"
                    value={ssid}
                    onChange={(e) => setSsid(e.target.value)}
                    placeholder="Enter your WiFi name..."
                    data-testid="input-ssid"
                  />
                </div>

                {/* Security Type */}
                <div>
                  <Label className="mb-2 block">Security Type</Label>
                  <Select value={security} onValueChange={(v) => setSecurity(v as SecurityType)}>
                    <SelectTrigger data-testid="select-security">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="WPA">WPA/WPA2/WPA3</SelectItem>
                      <SelectItem value="WEP">WEP</SelectItem>
                      <SelectItem value="nopass">Open (No Password)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Password */}
                {security !== "nopass" && (
                  <div>
                    <Label htmlFor="password" className="mb-2 block">Password</Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter WiFi password..."
                        className="pr-10"
                        data-testid="input-password"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-0 top-0 h-full"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </Button>
                    </div>
                  </div>
                )}

                {/* Hidden Network */}
                <div className="flex items-center justify-between">
                  <Label htmlFor="hidden">Hidden Network</Label>
                  <Switch
                    id="hidden"
                    checked={hidden}
                    onCheckedChange={setHidden}
                    data-testid="switch-hidden"
                  />
                </div>

                {/* Colors */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="mb-2 block">QR Color</Label>
                    <div className="flex gap-2">
                      <input
                        type="color"
                        value={fgColor}
                        onChange={(e) => setFgColor(e.target.value)}
                        className="w-10 h-10 rounded cursor-pointer border-0"
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
              </div>
            </div>
          </Card>

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
