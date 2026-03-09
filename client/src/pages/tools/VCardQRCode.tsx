import { useState, useRef } from "react";
import { User, Download, Copy, Check, Phone, Mail, Globe, MapPin, Briefcase } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import SEO from "@/components/SEO";
import { HowItWorks, Features, FAQSection } from "@/components/SEOContent";

interface VCardData {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  company: string;
  title: string;
  website: string;
  address: string;
}

export default function VCardQRCode() {
  const [vcard, setVcard] = useState<VCardData>({
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
    company: "",
    title: "",
    website: "",
    address: "",
  });
  const [copied, setCopied] = useState(false);
  const [fgColor, setFgColor] = useState("#000000");
  const [bgColor, setBgColor] = useState("#FFFFFF");
  const qrRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const updateField = (field: keyof VCardData, value: string) => {
    setVcard(prev => ({ ...prev, [field]: value }));
  };

  const generateVCardString = () => {
    if (!vcard.firstName && !vcard.lastName && !vcard.phone && !vcard.email) {
      return "";
    }

    const lines = [
      "BEGIN:VCARD",
      "VERSION:3.0",
    ];

    if (vcard.firstName || vcard.lastName) {
      lines.push(`N:${vcard.lastName};${vcard.firstName};;;`);
      lines.push(`FN:${vcard.firstName} ${vcard.lastName}`.trim());
    }
    if (vcard.company) lines.push(`ORG:${vcard.company}`);
    if (vcard.title) lines.push(`TITLE:${vcard.title}`);
    if (vcard.phone) lines.push(`TEL;TYPE=CELL:${vcard.phone}`);
    if (vcard.email) lines.push(`EMAIL:${vcard.email}`);
    if (vcard.website) lines.push(`URL:${vcard.website}`);
    if (vcard.address) lines.push(`ADR;TYPE=WORK:;;${vcard.address};;;;`);

    lines.push("END:VCARD");

    return lines.join("\n");
  };

  const vcardString = generateVCardString();
  const hasContent = vcardString.length > 0;

  const downloadQR = (format: "png" | "svg") => {
    if (!qrRef.current || !hasContent) return;
    
    const svg = qrRef.current.querySelector("svg");
    if (!svg) return;

    const fileName = `vcard-${vcard.firstName}-${vcard.lastName}`.toLowerCase().replace(/\s+/g, "-") || "vcard";

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

    toast({ title: "Downloaded!", description: `vCard QR code saved as ${format.toUpperCase()}` });
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
              new (window as any).ClipboardItem({ "image/png": blob })
            ]);
            setCopied(true);
            toast({ title: "Copied!", description: "vCard QR code copied to clipboard" });
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
    { step: 1, title: "Enter Details", description: "Fill in your contact information." },
    { step: 2, title: "Generate QR", description: "The QR code updates as you type." },
    { step: 3, title: "Share", description: "Let others scan to save your contact." },
  ];

  const features = [
    { icon: <User className="w-6 h-6" />, title: "Digital Business Card", description: "Share contact info in one scan." },
    { icon: <Phone className="w-6 h-6" />, title: "Phone & Email", description: "Include all your contact methods." },
    { icon: <Briefcase className="w-6 h-6" />, title: "Company Info", description: "Add your job title and company." },
  ];

  const faqItems = [
    { question: "What is a vCard QR code?", answer: "A vCard QR code contains your contact information. When scanned, it prompts the user to save your details to their contacts." },
    { question: "What info can I include?", answer: "Name, phone, email, company, job title, website, and address. Fill in as much or as little as you need." },
    { question: "Does this work on all phones?", answer: "Yes! Both iPhone and Android can read vCard QR codes with their camera apps and will prompt to add the contact." },
  ];

  return (
    <>
      <SEO
        title="vCard QR Code Generator - Digital Business Card | TymFlo Hub"
        description="Create a vCard QR code for your business card. Let people scan to instantly save your contact information."
        canonical="https://tymflohub.com/tools/vcard-qr"
        keywords="vcard qr code, business card qr, contact qr code, digital business card"
      />

      <div className="py-8 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/20 dark:to-teal-950/20 min-h-[calc(100vh-4rem)]">
        <div className="container mx-auto max-w-4xl px-4">
          <div className="mb-6 text-center">
            <div className="flex items-center justify-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                <User className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-2xl font-bold">vCard QR Code Generator</h1>
            </div>
            <p className="text-muted-foreground">
              Create a digital business card - share your contact info instantly
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
                  {hasContent ? (
                    <QRCodeSVG
                      value={vcardString}
                      size={200}
                      fgColor={fgColor}
                      bgColor={bgColor}
                      level="M"
                    />
                  ) : (
                    <div className="w-[200px] h-[200px] flex items-center justify-center border-2 border-dashed rounded-lg">
                      <p className="text-muted-foreground text-center px-4">
                        Enter your contact info to generate QR code
                      </p>
                    </div>
                  )}
                </div>

                {/* Preview Card */}
                {hasContent && (
                  <div className="w-full p-4 bg-muted/50 rounded-lg mb-4">
                    <p className="font-semibold">{vcard.firstName} {vcard.lastName}</p>
                    {vcard.title && <p className="text-sm text-muted-foreground">{vcard.title}</p>}
                    {vcard.company && <p className="text-sm text-muted-foreground">{vcard.company}</p>}
                    {vcard.phone && <p className="text-sm flex items-center gap-1"><Phone className="w-3 h-3" /> {vcard.phone}</p>}
                    {vcard.email && <p className="text-sm flex items-center gap-1"><Mail className="w-3 h-3" /> {vcard.email}</p>}
                  </div>
                )}

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

              {/* Form */}
              <div className="space-y-4">
                {/* Name */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="firstName" className="mb-2 block">First Name</Label>
                    <Input
                      id="firstName"
                      value={vcard.firstName}
                      onChange={(e) => updateField("firstName", e.target.value)}
                      placeholder="John"
                      data-testid="input-first-name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName" className="mb-2 block">Last Name</Label>
                    <Input
                      id="lastName"
                      value={vcard.lastName}
                      onChange={(e) => updateField("lastName", e.target.value)}
                      placeholder="Doe"
                      data-testid="input-last-name"
                    />
                  </div>
                </div>

                {/* Contact */}
                <div>
                  <Label htmlFor="phone" className="mb-2 block flex items-center gap-1">
                    <Phone className="w-4 h-4" /> Phone
                  </Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={vcard.phone}
                    onChange={(e) => updateField("phone", e.target.value)}
                    placeholder="+1 555 123 4567"
                    data-testid="input-phone"
                  />
                </div>

                <div>
                  <Label htmlFor="email" className="mb-2 block flex items-center gap-1">
                    <Mail className="w-4 h-4" /> Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={vcard.email}
                    onChange={(e) => updateField("email", e.target.value)}
                    placeholder="john@example.com"
                    data-testid="input-email"
                  />
                </div>

                {/* Work */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="company" className="mb-2 block flex items-center gap-1">
                      <Briefcase className="w-4 h-4" /> Company
                    </Label>
                    <Input
                      id="company"
                      value={vcard.company}
                      onChange={(e) => updateField("company", e.target.value)}
                      placeholder="Acme Inc"
                      data-testid="input-company"
                    />
                  </div>
                  <div>
                    <Label htmlFor="title" className="mb-2 block">Job Title</Label>
                    <Input
                      id="title"
                      value={vcard.title}
                      onChange={(e) => updateField("title", e.target.value)}
                      placeholder="Developer"
                      data-testid="input-title"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="website" className="mb-2 block flex items-center gap-1">
                    <Globe className="w-4 h-4" /> Website
                  </Label>
                  <Input
                    id="website"
                    type="url"
                    value={vcard.website}
                    onChange={(e) => updateField("website", e.target.value)}
                    placeholder="https://example.com"
                    data-testid="input-website"
                  />
                </div>

                <div>
                  <Label htmlFor="address" className="mb-2 block flex items-center gap-1">
                    <MapPin className="w-4 h-4" /> Address
                  </Label>
                  <Input
                    id="address"
                    value={vcard.address}
                    onChange={(e) => updateField("address", e.target.value)}
                    placeholder="123 Main St, City"
                    data-testid="input-address"
                  />
                </div>

                {/* Colors */}
                <div className="grid grid-cols-2 gap-4 pt-2">
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
