import { useState, useRef } from "react";
import { QRCodeSVG } from "qrcode.react";
import {
  Building2,
  Download,
  Copy,
  Check,
  Clock,
  MapPin,
  Star,
  FileText,
  ChevronDown,
  ChevronUp,
  ExternalLink,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import SEO from "@/components/SEO";
import { HowItWorks, Features, FAQSection } from "@/components/SEOContent";

interface OpenHours {
  monday: string;
  tuesday: string;
  wednesday: string;
  thursday: string;
  friday: string;
  saturday: string;
  sunday: string;
}

interface BusinessInfo {
  name: string;
  tagline: string;
  description: string;
  website: string;
  phone: string;
  email: string;
  address: string;
  facilities: string;
  openHours: OpenHours;
}

const defaultHours: OpenHours = {
  monday: "9:00 AM - 5:00 PM",
  tuesday: "9:00 AM - 5:00 PM",
  wednesday: "9:00 AM - 5:00 PM",
  thursday: "9:00 AM - 5:00 PM",
  friday: "9:00 AM - 5:00 PM",
  saturday: "10:00 AM - 2:00 PM",
  sunday: "Closed",
};

export default function BusinessPageQR() {
  const [business, setBusiness] = useState<BusinessInfo>({
    name: "",
    tagline: "",
    description: "",
    website: "",
    phone: "",
    email: "",
    address: "",
    facilities: "",
    openHours: defaultHours,
  });
  const [fgColor, setFgColor] = useState("#000000");
  const [bgColor, setBgColor] = useState("#FFFFFF");
  const [copied, setCopied] = useState(false);
  const [expandedSections, setExpandedSections] = useState({
    hours: false,
    location: false,
    facilities: false,
    summary: false,
  });
  const qrRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const hasContent = business.name.trim() !== "";

  // Generate vCard-like string for the QR code
  const generateQRData = () => {
    const lines: string[] = [];
    lines.push("BEGIN:VCARD");
    lines.push("VERSION:3.0");
    if (business.name) lines.push(`FN:${business.name}`);
    if (business.tagline) lines.push(`TITLE:${business.tagline}`);
    if (business.phone) lines.push(`TEL:${business.phone}`);
    if (business.email) lines.push(`EMAIL:${business.email}`);
    if (business.website) lines.push(`URL:${business.website}`);
    if (business.address) lines.push(`ADR:;;${business.address};;;`);
    if (business.description) lines.push(`NOTE:${business.description}`);
    lines.push("END:VCARD");
    return lines.join("\n");
  };

  const qrData = generateQRData();

  const updateBusiness = (field: keyof BusinessInfo, value: string) => {
    setBusiness((prev) => ({ ...prev, [field]: value }));
  };

  const updateHours = (day: keyof OpenHours, value: string) => {
    setBusiness((prev) => ({
      ...prev,
      openHours: { ...prev.openHours, [day]: value },
    }));
  };

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const downloadQR = (format: "png" | "svg") => {
    if (!qrRef.current || !hasContent) return;

    const svg = qrRef.current.querySelector("svg");
    if (!svg) return;

    const fileName = `business-${business.name.toLowerCase().replace(/\s+/g, "-")}`;

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

    toast({ title: "Downloaded!", description: `Business QR code saved as ${format.toUpperCase()}` });
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
            toast({ title: "Copied!", description: "Business QR code copied to clipboard" });
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
    { step: 1, title: "Enter Business Info", description: "Add your business name, description, and contact details." },
    { step: 2, title: "Add Hours & Location", description: "Include your open hours and address." },
    { step: 3, title: "Share", description: "Download the QR code and share it anywhere." },
  ];

  const features = [
    { icon: <Building2 className="w-6 h-6" />, title: "Complete Business Card", description: "All your business info in one scan." },
    { icon: <Clock className="w-6 h-6" />, title: "Open Hours", description: "Let customers know when you're available." },
    { icon: <MapPin className="w-6 h-6" />, title: "Location Info", description: "Help customers find you easily." },
  ];

  const faqItems = [
    { question: "What information can I include?", answer: "You can include your business name, tagline, description, website, phone, email, address, open hours, and facilities/amenities." },
    { question: "How does the QR code work?", answer: "The QR code contains your business information in vCard format. When scanned, it prompts the user to save your business as a contact." },
    { question: "Can I customize the colors?", answer: "Yes! You can customize the QR code colors to match your brand." },
  ];

  return (
    <>
      <SEO
        title="Business Page QR Code Generator | TymFlo Hub"
        description="Create a QR code with your business information. Include hours, location, contact details, and more."
        canonical="https://tymflohub.com/tools/business-qr"
        keywords="business qr code, business card qr, company qr code, contact qr"
      />

      <div className="py-8 bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-950/20 dark:to-amber-950/20 min-h-[calc(100vh-4rem)]">
        <div className="container mx-auto max-w-5xl px-4">
          <div className="mb-6 text-center">
            <div className="flex items-center justify-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center">
                <Building2 className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-2xl font-bold">Business Page QR Code</h1>
            </div>
            <p className="text-muted-foreground">
              Create a QR code with all your business information
            </p>
          </div>

          <Card className="p-6 mb-8">
            <div className="grid lg:grid-cols-2 gap-8">
              {/* Form */}
              <div className="space-y-6">
                <div>
                  <h3 className="font-semibold mb-4 flex items-center gap-2">
                    <Building2 className="w-4 h-4" />
                    Business Information
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="name">Business Name *</Label>
                      <Input
                        id="name"
                        value={business.name}
                        onChange={(e) => updateBusiness("name", e.target.value)}
                        placeholder="e.g. WatcheRIO"
                        data-testid="input-business-name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="tagline">Tagline</Label>
                      <Input
                        id="tagline"
                        value={business.tagline}
                        onChange={(e) => updateBusiness("tagline", e.target.value)}
                        placeholder="e.g. Cdl Limited"
                        data-testid="input-tagline"
                      />
                    </div>
                    <div>
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        value={business.description}
                        onChange={(e) => updateBusiness("description", e.target.value)}
                        placeholder="Describe your business..."
                        rows={3}
                        data-testid="input-description"
                      />
                    </div>
                    <div>
                      <Label htmlFor="website">Website</Label>
                      <Input
                        id="website"
                        value={business.website}
                        onChange={(e) => updateBusiness("website", e.target.value)}
                        placeholder="https://example.com"
                        data-testid="input-website"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="phone">Phone</Label>
                        <Input
                          id="phone"
                          value={business.phone}
                          onChange={(e) => updateBusiness("phone", e.target.value)}
                          placeholder="+1 234 567 8900"
                          data-testid="input-phone"
                        />
                      </div>
                      <div>
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          value={business.email}
                          onChange={(e) => updateBusiness("email", e.target.value)}
                          placeholder="contact@example.com"
                          data-testid="input-email"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Collapsible Sections */}
                <div className="space-y-3">
                  {/* Open Hours */}
                  <div className="border rounded-lg">
                    <button
                      onClick={() => toggleSection("hours")}
                      className="w-full p-4 flex items-center justify-between hover-elevate rounded-lg"
                      data-testid="toggle-hours"
                    >
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-muted-foreground" />
                        <span className="font-medium">Open Hours</span>
                      </div>
                      {expandedSections.hours ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                    {expandedSections.hours && (
                      <div className="px-4 pb-4 space-y-2">
                        {Object.entries(business.openHours).map(([day, hours]) => (
                          <div key={day} className="flex items-center gap-2">
                            <span className="w-24 text-sm capitalize">{day}</span>
                            <Input
                              value={hours}
                              onChange={(e) => updateHours(day as keyof OpenHours, e.target.value)}
                              placeholder="e.g. 9:00 AM - 5:00 PM"
                              className="flex-1"
                              data-testid={`input-hours-${day}`}
                            />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Location */}
                  <div className="border rounded-lg">
                    <button
                      onClick={() => toggleSection("location")}
                      className="w-full p-4 flex items-center justify-between hover-elevate rounded-lg"
                      data-testid="toggle-location"
                    >
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-muted-foreground" />
                        <span className="font-medium">Location</span>
                      </div>
                      {expandedSections.location ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                    {expandedSections.location && (
                      <div className="px-4 pb-4">
                        <Textarea
                          value={business.address}
                          onChange={(e) => updateBusiness("address", e.target.value)}
                          placeholder="Enter your full address..."
                          rows={2}
                          data-testid="input-address"
                        />
                      </div>
                    )}
                  </div>

                  {/* Facilities */}
                  <div className="border rounded-lg">
                    <button
                      onClick={() => toggleSection("facilities")}
                      className="w-full p-4 flex items-center justify-between hover-elevate rounded-lg"
                      data-testid="toggle-facilities"
                    >
                      <div className="flex items-center gap-2">
                        <Star className="w-4 h-4 text-muted-foreground" />
                        <span className="font-medium">Facilities</span>
                      </div>
                      {expandedSections.facilities ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                    {expandedSections.facilities && (
                      <div className="px-4 pb-4">
                        <Textarea
                          value={business.facilities}
                          onChange={(e) => updateBusiness("facilities", e.target.value)}
                          placeholder="e.g. Free WiFi, Parking, Wheelchair Accessible..."
                          rows={2}
                          data-testid="input-facilities"
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* Color Customization */}
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
                      <div className="bg-gray-900 text-white text-xs flex justify-between px-6 py-2">
                        <span>18:45</span>
                        <div className="flex gap-1 items-center">
                          <span>5G</span>
                          <div className="w-6 h-3 border border-white rounded-sm">
                            <div className="w-4 h-full bg-white rounded-sm" />
                          </div>
                        </div>
                      </div>

                      {/* Business Page Preview */}
                      <div className="bg-gradient-to-b from-orange-300 to-orange-200 min-h-[400px]">
                        {/* Header Image Area */}
                        <div className="h-24 bg-orange-400/50 flex items-center justify-center">
                          <Building2 className="w-12 h-12 text-orange-700/50" />
                        </div>

                        {/* Content */}
                        <div className="bg-white rounded-t-3xl -mt-4 p-5 min-h-[320px]">
                          <h3 className="font-bold text-lg text-gray-900">
                            {business.name || "Your Business"}
                          </h3>
                          {business.tagline && (
                            <p className="text-sm text-gray-500 mb-2">{business.tagline}</p>
                          )}
                          {business.description && (
                            <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                              {business.description}
                            </p>
                          )}

                          {business.website && (
                            <button className="w-full bg-orange-500 text-white py-2 rounded-lg mb-4 text-sm font-medium flex items-center justify-center gap-2">
                              <ExternalLink className="w-4 h-4" />
                              Learn more
                            </button>
                          )}

                          <div className="space-y-2 text-xs">
                            {Object.values(business.openHours).some((h) => h) && (
                              <div className="py-2 border-b">
                                <div className="flex items-center gap-2 text-gray-500 mb-1">
                                  <Clock className="w-3 h-3" />
                                  <span className="font-medium">Open Hours</span>
                                </div>
                                <div className="text-gray-600 pl-5 space-y-0.5">
                                  {business.openHours.monday && <div>Mon: {business.openHours.monday}</div>}
                                  {business.openHours.tuesday && <div>Tue: {business.openHours.tuesday}</div>}
                                  {business.openHours.wednesday && <div>Wed: {business.openHours.wednesday}</div>}
                                  {business.openHours.thursday && <div>Thu: {business.openHours.thursday}</div>}
                                  {business.openHours.friday && <div>Fri: {business.openHours.friday}</div>}
                                  {business.openHours.saturday && <div>Sat: {business.openHours.saturday}</div>}
                                  {business.openHours.sunday && <div>Sun: {business.openHours.sunday}</div>}
                                </div>
                              </div>
                            )}
                            {business.address && (
                              <div className="py-2 border-b">
                                <div className="flex items-center gap-2 text-gray-500 mb-1">
                                  <MapPin className="w-3 h-3" />
                                  <span className="font-medium">Location</span>
                                </div>
                                <div className="text-gray-600 pl-5 line-clamp-2">{business.address}</div>
                              </div>
                            )}
                            {business.facilities && (
                              <div className="py-2 border-b">
                                <div className="flex items-center gap-2 text-gray-500 mb-1">
                                  <Star className="w-3 h-3" />
                                  <span className="font-medium">Facilities</span>
                                </div>
                                <div className="text-gray-600 pl-5 line-clamp-2">{business.facilities}</div>
                              </div>
                            )}
                            {(business.phone || business.email) && (
                              <div className="py-2">
                                <div className="flex items-center gap-2 text-gray-500 mb-1">
                                  <FileText className="w-3 h-3" />
                                  <span className="font-medium">Contact</span>
                                </div>
                                <div className="text-gray-600 pl-5">
                                  {business.phone && <div>{business.phone}</div>}
                                  {business.email && <div>{business.email}</div>}
                                </div>
                              </div>
                            )}
                          </div>
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
                        Enter business name to generate QR
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
