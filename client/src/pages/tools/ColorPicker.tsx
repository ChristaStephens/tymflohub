import { useState, useEffect } from "react";
import { Palette, Copy, Check, Pipette } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import SEO from "@/components/SEO";
import { HowItWorks, Features, FAQSection } from "@/components/SEOContent";

declare global {
  interface Window {
    EyeDropper?: new () => {
      open(): Promise<{ sRGBHex: string }>;
    };
  }
}

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}

function rgbToHex(r: number, g: number, b: number): string {
  return "#" + [r, g, b].map(x => x.toString(16).padStart(2, "0")).join("");
}

function rgbToHsl(r: number, g: number, b: number): { h: number; s: number; l: number } {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }

  return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
}

function rgbToCmyk(r: number, g: number, b: number): { c: number; m: number; y: number; k: number } {
  r /= 255; g /= 255; b /= 255;
  const k = 1 - Math.max(r, g, b);
  if (k === 1) return { c: 0, m: 0, y: 0, k: 100 };
  const c = Math.round(((1 - r - k) / (1 - k)) * 100);
  const m = Math.round(((1 - g - k) / (1 - k)) * 100);
  const y = Math.round(((1 - b - k) / (1 - k)) * 100);
  return { c, m, y, k: Math.round(k * 100) };
}

function hslToRgb(h: number, s: number, l: number): { r: number; g: number; b: number } {
  h /= 360; s /= 100; l /= 100;
  let r, g, b;

  if (s === 0) {
    r = g = b = l;
  } else {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1/6) return p + (q - p) * 6 * t;
      if (t < 1/2) return q;
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
      return p;
    };
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1/3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1/3);
  }

  return { r: Math.round(r * 255), g: Math.round(g * 255), b: Math.round(b * 255) };
}

export default function ColorPicker() {
  const [hex, setHex] = useState("#463176");
  const [rgb, setRgb] = useState({ r: 70, g: 49, b: 118 });
  const [hsl, setHsl] = useState({ h: 258, s: 41, l: 33 });
  const [cmyk, setCmyk] = useState({ c: 41, m: 58, y: 0, k: 54 });
  const [copied, setCopied] = useState<string | null>(null);
  const [eyeDropperSupported, setEyeDropperSupported] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    setEyeDropperSupported(typeof window !== "undefined" && "EyeDropper" in window);
  }, []);

  useEffect(() => {
    const result = hexToRgb(hex);
    if (result) {
      setRgb(result);
      setHsl(rgbToHsl(result.r, result.g, result.b));
      setCmyk(rgbToCmyk(result.r, result.g, result.b));
    }
  }, [hex]);

  const handleEyeDropper = async () => {
    if (!window.EyeDropper) {
      toast({ title: "Not Supported", description: "Your browser doesn't support the eyedropper tool.", variant: "destructive" });
      return;
    }
    try {
      const eyeDropper = new window.EyeDropper();
      const result = await eyeDropper.open();
      setHex(result.sRGBHex);
      toast({ title: "Color Picked!", description: `Selected ${result.sRGBHex.toUpperCase()}` });
    } catch {
      // User cancelled
    }
  };

  const handleHexChange = (value: string) => {
    if (value.startsWith("#")) {
      setHex(value);
    } else {
      setHex("#" + value);
    }
  };

  const handleRgbChange = (key: "r" | "g" | "b", value: number) => {
    const newRgb = { ...rgb, [key]: Math.min(255, Math.max(0, value)) };
    setRgb(newRgb);
    setHex(rgbToHex(newRgb.r, newRgb.g, newRgb.b));
    setHsl(rgbToHsl(newRgb.r, newRgb.g, newRgb.b));
    setCmyk(rgbToCmyk(newRgb.r, newRgb.g, newRgb.b));
  };

  const handleHslChange = (key: "h" | "s" | "l", value: number) => {
    const max = key === "h" ? 360 : 100;
    const newHsl = { ...hsl, [key]: Math.min(max, Math.max(0, value)) };
    setHsl(newHsl);
    const newRgb = hslToRgb(newHsl.h, newHsl.s, newHsl.l);
    setRgb(newRgb);
    setHex(rgbToHex(newRgb.r, newRgb.g, newRgb.b));
    setCmyk(rgbToCmyk(newRgb.r, newRgb.g, newRgb.b));
  };

  const copyToClipboard = async (text: string, format: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(format);
    toast({ title: "Copied!", description: `${format} value copied to clipboard` });
    setTimeout(() => setCopied(null), 2000);
  };

  const colorFormats = [
    { label: "HEX", value: hex.toUpperCase(), format: "HEX" },
    { label: "RGB", value: `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`, format: "RGB" },
    { label: "HSL", value: `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`, format: "HSL" },
    { label: "CMYK", value: `cmyk(${cmyk.c}%, ${cmyk.m}%, ${cmyk.y}%, ${cmyk.k}%)`, format: "CMYK" },
  ];

  const howItWorksSteps = [
    { step: 1, title: "Pick Color", description: "Use the eyedropper, color picker, or enter a value." },
    { step: 2, title: "View Formats", description: "See HEX, RGB, HSL, and CMYK values instantly." },
    { step: 3, title: "Copy Value", description: "Click to copy any format to clipboard." },
  ];

  const features = [
    { icon: <Pipette className="w-6 h-6" />, title: "Eyedropper Tool", description: "Pick any color from your screen." },
    { icon: <Palette className="w-6 h-6" />, title: "Multiple Formats", description: "HEX, RGB, HSL, and CMYK values." },
    { icon: <Copy className="w-6 h-6" />, title: "Quick Copy", description: "One-click copy for any format." },
  ];

  const faqItems = [
    { question: "What's the difference between HEX and RGB?", answer: "HEX uses hexadecimal notation (#RRGGBB), while RGB uses decimal values (0-255) for each color channel. They represent the same colors differently." },
    { question: "When should I use CMYK?", answer: "CMYK (Cyan, Magenta, Yellow, Key/Black) is used for print design. Use it when preparing designs for physical printing." },
    { question: "How does the eyedropper work?", answer: "Click the eyedropper button, then click anywhere on your screen to pick that color. Works in Chrome, Edge, and other modern browsers." },
  ];

  return (
    <>
      <SEO
        title="Color Picker with Eyedropper - HEX, RGB, HSL, CMYK | TymFlo Hub"
        description="Free online color picker with eyedropper tool. Pick colors from your screen, convert between HEX, RGB, HSL, CMYK formats."
        canonical="https://tymflohub.com/tools/color-picker"
        keywords="color picker, eyedropper, hex to rgb, rgb to cmyk, color converter"
      />

      <div className="py-8 bg-gradient-to-br from-pink-50 to-rose-50 dark:from-pink-950/20 dark:to-rose-950/20 min-h-[calc(100vh-4rem)]">
        <div className="container mx-auto max-w-4xl px-4">
          <div className="mb-6 text-center">
            <div className="flex items-center justify-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center">
                <Palette className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-2xl font-bold">Color Picker</h1>
            </div>
            <p className="text-muted-foreground">
              Pick colors from screen and convert between formats
            </p>
          </div>

          <Card className="p-6 mb-8">
            <div className="grid md:grid-cols-2 gap-8">
              {/* Color Preview */}
              <div>
                <div
                  className="w-full aspect-square rounded-xl shadow-lg mb-4 border-4 border-white"
                  style={{ backgroundColor: hex }}
                  data-testid="color-preview"
                />
                <div className="flex items-center gap-2">
                  {eyeDropperSupported && (
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={handleEyeDropper}
                      className="shrink-0"
                      data-testid="button-eyedropper"
                    >
                      <Pipette className="w-5 h-5" />
                    </Button>
                  )}
                  <input
                    type="color"
                    value={hex}
                    onChange={(e) => setHex(e.target.value)}
                    className="w-12 h-12 rounded-lg cursor-pointer border-0 shrink-0"
                    data-testid="input-color-picker"
                  />
                  <Input
                    value={hex}
                    onChange={(e) => handleHexChange(e.target.value)}
                    className="font-mono text-lg"
                    maxLength={7}
                    data-testid="input-hex"
                  />
                </div>
                {eyeDropperSupported && (
                  <p className="text-xs text-muted-foreground mt-2 text-center">
                    Click the eyedropper to pick a color from anywhere on screen
                  </p>
                )}
              </div>

              {/* Color Values */}
              <div className="space-y-6">
                {/* Format Buttons */}
                <div className="space-y-3">
                  {colorFormats.map((format) => (
                    <Button
                      key={format.format}
                      variant="outline"
                      className="w-full justify-between font-mono text-sm"
                      onClick={() => copyToClipboard(format.value, format.format)}
                      data-testid={`button-copy-${format.format.toLowerCase()}`}
                    >
                      <span className="text-muted-foreground">{format.label}:</span>
                      <span className="flex items-center gap-2">
                        <span className="truncate max-w-[150px]">{format.value}</span>
                        {copied === format.format ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      </span>
                    </Button>
                  ))}
                </div>

                {/* RGB Sliders */}
                <div className="space-y-3">
                  <Label className="font-semibold">RGB Values</Label>
                  {["r", "g", "b"].map((channel) => (
                    <div key={channel} className="flex items-center gap-3">
                      <span className="w-6 text-sm font-mono uppercase">{channel}</span>
                      <input
                        type="range"
                        min="0"
                        max="255"
                        value={rgb[channel as keyof typeof rgb]}
                        onChange={(e) => handleRgbChange(channel as "r" | "g" | "b", parseInt(e.target.value))}
                        className="flex-1"
                        data-testid={`slider-${channel}`}
                      />
                      <Input
                        type="number"
                        min="0"
                        max="255"
                        value={rgb[channel as keyof typeof rgb]}
                        onChange={(e) => handleRgbChange(channel as "r" | "g" | "b", parseInt(e.target.value) || 0)}
                        className="w-16 text-center font-mono"
                      />
                    </div>
                  ))}
                </div>

                {/* HSL Sliders */}
                <div className="space-y-3">
                  <Label className="font-semibold">HSL Values</Label>
                  {[
                    { key: "h", label: "H", max: 360 },
                    { key: "s", label: "S", max: 100 },
                    { key: "l", label: "L", max: 100 },
                  ].map((item) => (
                    <div key={item.key} className="flex items-center gap-3">
                      <span className="w-6 text-sm font-mono">{item.label}</span>
                      <input
                        type="range"
                        min="0"
                        max={item.max}
                        value={hsl[item.key as keyof typeof hsl]}
                        onChange={(e) => handleHslChange(item.key as "h" | "s" | "l", parseInt(e.target.value))}
                        className="flex-1"
                        data-testid={`slider-${item.key}`}
                      />
                      <Input
                        type="number"
                        min="0"
                        max={item.max}
                        value={hsl[item.key as keyof typeof hsl]}
                        onChange={(e) => handleHslChange(item.key as "h" | "s" | "l", parseInt(e.target.value) || 0)}
                        className="w-16 text-center font-mono"
                      />
                    </div>
                  ))}
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
