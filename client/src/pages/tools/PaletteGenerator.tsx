import { useState, useCallback, useEffect } from "react";
import { Palette, Copy, Check, RefreshCw, Lock, Unlock, Space } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import SEO from "@/components/SEO";
import { HowItWorks, Features, FAQSection } from "@/components/SEOContent";

interface PaletteData {
  id: string;
  name: string;
  colors: string[];
  likes: string;
}

const trendingPalettes: PaletteData[] = [
  { id: "1", name: "Olive Garden Feast", colors: ["606C38", "283618", "FEFAE0", "DDA15E", "BC6C25"], likes: "98.6K" },
  { id: "2", name: "Fiery Ocean", colors: ["780000", "C1121F", "FDF0D5", "003049", "669BBC"], likes: "35.8K" },
  { id: "3", name: "Refreshing Summer Fun", colors: ["8ECAE6", "219EBC", "023047", "FFB703", "FB8500"], likes: "68.4K" },
  { id: "4", name: "Pastel Dreamland", colors: ["CDB4DB", "FFC8DD", "FFAFCC", "BDE0FE", "A2D2FF"], likes: "88.8K" },
  { id: "5", name: "Earthy Forest", colors: ["DAD7CD", "A3B18A", "588157", "3A5A40", "344E41"], likes: "49.6K" },
  { id: "6", name: "Golden Summer Fields", colors: ["CCD5AE", "E9EDC9", "FEFAE0", "FAEDCD", "D4A373"], likes: "85.6K" },
  { id: "7", name: "Ocean Breeze", colors: ["E63946", "F1FAEE", "A8DADC", "457B9D", "1D3557"], likes: "79.6K" },
  { id: "8", name: "Bold Berry", colors: ["F9DBBD", "FFA5AB", "DA627D", "A53860", "450920"], likes: "13.4K" },
  { id: "9", name: "Sunny Beach Day", colors: ["264653", "2A9D8F", "E9C46A", "F4A261", "E76F51"], likes: "125.1K" },
  { id: "10", name: "Deep Sea", colors: ["0D1B2A", "1B263B", "415A77", "778DA9", "E0E1DD"], likes: "27.9K" },
  { id: "11", name: "Soft Pink Delight", colors: ["FFE5EC", "FFC2D1", "FFB3C6", "FF8FAB", "FB6F92"], likes: "23.7K" },
  { id: "12", name: "Golden Twilight", colors: ["000814", "001D3D", "003566", "FFC300", "FFD60A"], likes: "24.8K" },
  { id: "13", name: "Vibrant Fiesta", colors: ["FFBE0B", "FB5607", "FF006E", "8338EC", "3A86FF"], likes: "45.6K" },
  { id: "14", name: "Purple Dream", colors: ["231942", "5E548E", "9F86C0", "BE95C4", "E0B1CB"], likes: "18.5K" },
  { id: "15", name: "Coastal Vibes", colors: ["3D5A80", "98C1D9", "E0FBFC", "EE6C4D", "293241"], likes: "28.6K" },
  { id: "16", name: "Candy Pop", colors: ["9B5DE5", "F15BB5", "FEE440", "00BBF9", "00F5D4"], likes: "23.8K" },
];

const colorFilters = [
  { name: "Red", color: "#EF4444" },
  { name: "Orange", color: "#F97316" },
  { name: "Brown", color: "#92400E" },
  { name: "Yellow", color: "#EAB308" },
  { name: "Green", color: "#22C55E" },
  { name: "Turquoise", color: "#14B8A6" },
  { name: "Blue", color: "#3B82F6" },
  { name: "Violet", color: "#8B5CF6" },
  { name: "Pink", color: "#EC4899" },
  { name: "Gray", color: "#6B7280" },
];

const styleFilters = ["Warm", "Cold", "Bright", "Dark", "Pastel", "Vintage", "Monochromatic", "Gradient"];

function generateRandomColor(): string {
  return Math.floor(Math.random() * 16777215).toString(16).padStart(6, "0").toUpperCase();
}

function generateRandomPalette(count: number = 5): string[] {
  const colors: string[] = [];
  for (let i = 0; i < count; i++) {
    colors.push(generateRandomColor());
  }
  return colors;
}

function hexToHsl(hex: string): { h: number; s: number; l: number } {
  const r = parseInt(hex.slice(0, 2), 16) / 255;
  const g = parseInt(hex.slice(2, 4), 16) / 255;
  const b = parseInt(hex.slice(4, 6), 16) / 255;
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

  return { h: h * 360, s: s * 100, l: l * 100 };
}

function getContrastColor(hex: string): string {
  const { l } = hexToHsl(hex);
  return l > 50 ? "#000000" : "#FFFFFF";
}

export default function PaletteGenerator() {
  const [currentPalette, setCurrentPalette] = useState<string[]>(["606C38", "283618", "FEFAE0", "DDA15E", "BC6C25"]);
  const [lockedColors, setLockedColors] = useState<Set<number>>(new Set());
  const [copiedColor, setCopiedColor] = useState<string | null>(null);
  const [activeColorFilter, setActiveColorFilter] = useState<string | null>(null);
  const [activeStyleFilter, setActiveStyleFilter] = useState<string | null>(null);
  const [showGenerator, setShowGenerator] = useState(true);
  const { toast } = useToast();

  const generateNewPalette = useCallback(() => {
    setCurrentPalette(prev => {
      const newPalette = [...prev];
      for (let i = 0; i < newPalette.length; i++) {
        if (!lockedColors.has(i)) {
          newPalette[i] = generateRandomColor();
        }
      }
      return newPalette;
    });
  }, [lockedColors]);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.code === "Space" && showGenerator && e.target === document.body) {
        e.preventDefault();
        generateNewPalette();
      }
    };
    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [generateNewPalette, showGenerator]);

  const handleCopy = async (color: string) => {
    await navigator.clipboard.writeText(`#${color}`);
    setCopiedColor(color);
    toast({ title: "Copied!", description: `#${color} copied to clipboard` });
    setTimeout(() => setCopiedColor(null), 2000);
  };

  const toggleLock = (index: number) => {
    setLockedColors(prev => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  };

  const loadPalette = (palette: PaletteData) => {
    setCurrentPalette(palette.colors);
    setLockedColors(new Set());
    setShowGenerator(true);
    toast({ title: "Palette Loaded", description: palette.name });
  };

  const copyAllColors = async () => {
    const text = currentPalette.map(c => `#${c}`).join(", ");
    await navigator.clipboard.writeText(text);
    toast({ title: "Copied All!", description: "All colors copied to clipboard" });
  };

  const filteredPalettes = trendingPalettes.filter(palette => {
    if (activeColorFilter) {
      const filter = colorFilters.find(f => f.name === activeColorFilter);
      if (!filter) return true;
      const filterHue = hexToHsl(filter.color.slice(1)).h;
      return palette.colors.some(color => {
        if (!color || color.length < 6) return false;
        const colorHue = hexToHsl(color).h;
        const hueDiff = Math.abs(colorHue - filterHue);
        return hueDiff < 30 || hueDiff > 330;
      });
    }
    return true;
  });

  const howItWorksSteps = [
    { step: 1, title: "Generate", description: "Press spacebar or click to generate new colors." },
    { step: 2, title: "Lock Colors", description: "Lock colors you like to keep them while regenerating." },
    { step: 3, title: "Copy & Use", description: "Click any color to copy its HEX value." },
  ];

  const features = [
    { icon: <Palette className="w-6 h-6" />, title: "Instant Generation", description: "Press spacebar to generate new palettes." },
    { icon: <Lock className="w-6 h-6" />, title: "Lock Colors", description: "Keep colors you like while shuffling others." },
    { icon: <Copy className="w-6 h-6" />, title: "Trending Palettes", description: "Browse popular color combinations." },
  ];

  const faqItems = [
    { question: "How do I generate new colors?", answer: "Press the spacebar on your keyboard or click the refresh button. Locked colors will stay the same." },
    { question: "Can I save my palettes?", answer: "Click any color to copy its HEX code. You can copy all colors at once using the 'Copy All' button." },
    { question: "What are trending palettes?", answer: "These are popular color combinations curated from the design community. Click any to load it into the generator." },
  ];

  return (
    <>
      <SEO
        title="Color Palette Generator - Create Beautiful Palettes | TymFlo Hub"
        description="Free color palette generator like Coolors. Generate, explore, and copy beautiful color schemes. Press spacebar to create new palettes."
        canonical="https://tymflohub.com/tools/palette-generator"
        keywords="color palette generator, coolors alternative, color scheme, palette creator"
      />

      <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-fuchsia-50 to-purple-50 dark:from-fuchsia-950/20 dark:to-purple-950/20">
        {/* Interactive Palette Generator */}
        {showGenerator && (
          <div className="h-[60vh] flex">
            {currentPalette.map((color, index) => (
              <div
                key={index}
                className="flex-1 relative group cursor-pointer transition-all hover:flex-[1.2]"
                style={{ backgroundColor: `#${color}` }}
                onClick={() => handleCopy(color)}
                data-testid={`color-bar-${index}`}
              >
                {/* Color Info */}
                <div
                  className="absolute bottom-8 left-1/2 -translate-x-1/2 text-center opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{ color: getContrastColor(color) }}
                >
                  <p className="text-2xl font-mono font-bold mb-2">#{color}</p>
                  <div className="flex gap-2 justify-center">
                    <Button
                      size="icon"
                      variant="secondary"
                      className="h-10 w-10"
                      onClick={(e) => { e.stopPropagation(); toggleLock(index); }}
                      data-testid={`button-lock-${index}`}
                    >
                      {lockedColors.has(index) ? <Lock className="w-5 h-5" /> : <Unlock className="w-5 h-5" />}
                    </Button>
                    <Button
                      size="icon"
                      variant="secondary"
                      className="h-10 w-10"
                      onClick={(e) => { e.stopPropagation(); handleCopy(color); }}
                    >
                      {copiedColor === color ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                    </Button>
                  </div>
                </div>

                {/* Lock indicator */}
                {lockedColors.has(index) && (
                  <div className="absolute top-4 left-1/2 -translate-x-1/2">
                    <Lock className="w-6 h-6" style={{ color: getContrastColor(color) }} />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Controls */}
        <div className="container mx-auto max-w-6xl px-4 py-6">
          <div className="flex flex-wrap items-center justify-center gap-4 mb-8">
            <Button onClick={generateNewPalette} size="lg" data-testid="button-generate">
              <RefreshCw className="w-5 h-5 mr-2" />
              Generate
            </Button>
            <Button variant="outline" size="lg" onClick={copyAllColors} data-testid="button-copy-all">
              <Copy className="w-5 h-5 mr-2" />
              Copy All
            </Button>
            <p className="text-sm text-muted-foreground">
              Press <kbd className="px-2 py-1 bg-muted rounded text-xs">Space</kbd> to generate
            </p>
          </div>

          {/* Filters */}
          <Card className="p-6 mb-8">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Color Filters */}
              <div>
                <h3 className="font-semibold mb-3">Colors</h3>
                <div className="flex flex-wrap gap-2">
                  {colorFilters.map(filter => (
                    <Badge
                      key={filter.name}
                      variant={activeColorFilter === filter.name ? "default" : "outline"}
                      className="cursor-pointer gap-1.5 px-3 py-1.5"
                      onClick={() => setActiveColorFilter(activeColorFilter === filter.name ? null : filter.name)}
                      data-testid={`filter-color-${filter.name.toLowerCase()}`}
                    >
                      <span
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: filter.color }}
                      />
                      {filter.name}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Style Filters */}
              <div>
                <h3 className="font-semibold mb-3">Styles</h3>
                <div className="flex flex-wrap gap-2">
                  {styleFilters.map(style => (
                    <Badge
                      key={style}
                      variant={activeStyleFilter === style ? "default" : "outline"}
                      className="cursor-pointer px-3 py-1.5"
                      onClick={() => setActiveStyleFilter(activeStyleFilter === style ? null : style)}
                      data-testid={`filter-style-${style.toLowerCase()}`}
                    >
                      {style}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </Card>

          {/* Trending Palettes */}
          <div className="mb-8">
            <h2 className="text-xl font-bold mb-4">Trending Palettes</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {filteredPalettes.map(palette => (
                <Card
                  key={palette.id}
                  className="overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
                  onClick={() => loadPalette(palette)}
                  data-testid={`palette-card-${palette.id}`}
                >
                  <div className="flex h-24">
                    {palette.colors.map((color, idx) => (
                      <div
                        key={idx}
                        className="flex-1"
                        style={{ backgroundColor: `#${color}` }}
                      />
                    ))}
                  </div>
                  <div className="p-3 flex items-center justify-between">
                    <span className="text-sm font-medium truncate">{palette.name}</span>
                    <span className="text-xs text-muted-foreground">{palette.likes}</span>
                  </div>
                </Card>
              ))}
            </div>
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
