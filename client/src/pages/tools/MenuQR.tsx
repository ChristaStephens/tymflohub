import { useState, useRef } from "react";
import { QRCodeSVG } from "qrcode.react";
import {
  UtensilsCrossed,
  Download,
  Copy,
  Check,
  Plus,
  Trash2,
  ChevronRight,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import SEO from "@/components/SEO";
import { HowItWorks, Features, FAQSection } from "@/components/SEOContent";

interface MenuItem {
  id: string;
  name: string;
  price: string;
}

interface MenuCategory {
  id: string;
  name: string;
  items: MenuItem[];
}

interface RestaurantInfo {
  name: string;
  tagline: string;
  description: string;
}

const defaultCategories: MenuCategory[] = [
  { id: "1", name: "Starters", items: [] },
  { id: "2", name: "Main Course", items: [] },
  { id: "3", name: "Desserts", items: [] },
  { id: "4", name: "Drinks", items: [] },
];

export default function MenuQR() {
  const [restaurant, setRestaurant] = useState<RestaurantInfo>({
    name: "",
    tagline: "Food & Drinks",
    description: "",
  });
  const [categories, setCategories] = useState<MenuCategory[]>(defaultCategories);
  const [fgColor, setFgColor] = useState("#000000");
  const [bgColor, setBgColor] = useState("#FFFFFF");
  const [copied, setCopied] = useState(false);
  const qrRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const hasContent = restaurant.name.trim() !== "";

  // Generate menu data as a simple text format for the QR
  const generateQRData = () => {
    let text = `MENU: ${restaurant.name}\n`;
    if (restaurant.tagline) text += `${restaurant.tagline}\n`;
    if (restaurant.description) text += `${restaurant.description}\n`;
    text += "\n";

    categories.forEach((cat) => {
      const validItems = cat.items.filter(item => item.name.trim());
      if (validItems.length > 0 && cat.name.trim()) {
        text += `--- ${cat.name} ---\n`;
        validItems.forEach((item) => {
          text += `${item.name}`;
          if (item.price) text += ` - ${item.price}`;
          text += "\n";
        });
        text += "\n";
      }
    });

    return text.trim();
  };

  const qrData = generateQRData();

  const updateRestaurant = (field: keyof RestaurantInfo, value: string) => {
    setRestaurant((prev) => ({ ...prev, [field]: value }));
  };

  const addCategory = () => {
    const newId = Date.now().toString();
    setCategories((prev) => [...prev, { id: newId, name: "New Category", items: [] }]);
  };

  const updateCategory = (categoryId: string, name: string) => {
    setCategories((prev) =>
      prev.map((cat) => (cat.id === categoryId ? { ...cat, name } : cat))
    );
  };

  const removeCategory = (categoryId: string) => {
    setCategories((prev) => prev.filter((cat) => cat.id !== categoryId));
  };

  const addItem = (categoryId: string) => {
    const newItemId = Date.now().toString();
    setCategories((prev) =>
      prev.map((cat) =>
        cat.id === categoryId
          ? { ...cat, items: [...cat.items, { id: newItemId, name: "", price: "" }] }
          : cat
      )
    );
  };

  const updateItem = (categoryId: string, itemId: string, field: "name" | "price", value: string) => {
    setCategories((prev) =>
      prev.map((cat) =>
        cat.id === categoryId
          ? {
              ...cat,
              items: cat.items.map((item) =>
                item.id === itemId ? { ...item, [field]: value } : item
              ),
            }
          : cat
      )
    );
  };

  const removeItem = (categoryId: string, itemId: string) => {
    setCategories((prev) =>
      prev.map((cat) =>
        cat.id === categoryId
          ? { ...cat, items: cat.items.filter((item) => item.id !== itemId) }
          : cat
      )
    );
  };

  const downloadQR = (format: "png" | "svg") => {
    if (!qrRef.current || !hasContent) return;

    const svg = qrRef.current.querySelector("svg");
    if (!svg) return;

    const fileName = `menu-${restaurant.name.toLowerCase().replace(/\s+/g, "-")}`;

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

    toast({ title: "Downloaded!", description: `Menu QR code saved as ${format.toUpperCase()}` });
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
            toast({ title: "Copied!", description: "Menu QR code copied to clipboard" });
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
    { step: 1, title: "Add Restaurant Info", description: "Enter your restaurant name and description." },
    { step: 2, title: "Build Your Menu", description: "Add categories and items with prices." },
    { step: 3, title: "Share", description: "Print QR codes for tables or share online." },
  ];

  const features = [
    { icon: <UtensilsCrossed className="w-6 h-6" />, title: "Digital Menu", description: "Create a touchless menu experience." },
    { icon: <Plus className="w-6 h-6" />, title: "Easy Updates", description: "Update your menu anytime." },
    { icon: <Download className="w-6 h-6" />, title: "Print Ready", description: "Download and print for table displays." },
  ];

  const faqItems = [
    { question: "How do customers view the menu?", answer: "When customers scan the QR code, they'll see your menu displayed as text on their device." },
    { question: "Can I add prices?", answer: "Yes! Each menu item can have its own price displayed." },
    { question: "How many categories can I add?", answer: "You can add unlimited categories like Starters, Main Course, Desserts, Drinks, etc." },
  ];

  return (
    <>
      <SEO
        title="Menu QR Code Generator - Digital Restaurant Menu | TymFlo Hub"
        description="Create a QR code for your restaurant menu. Let customers scan and view your menu on their phone."
        canonical="https://tymflohub.com/tools/menu-qr"
        keywords="menu qr code, restaurant qr, digital menu, contactless menu"
      />

      <div className="py-8 bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-amber-950/20 dark:to-yellow-950/20 min-h-[calc(100vh-4rem)]">
        <div className="container mx-auto max-w-5xl px-4">
          <div className="mb-6 text-center">
            <div className="flex items-center justify-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-500 to-yellow-600 flex items-center justify-center">
                <UtensilsCrossed className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-2xl font-bold">Menu QR Code Generator</h1>
            </div>
            <p className="text-muted-foreground">
              Create a digital menu for your restaurant
            </p>
          </div>

          <Card className="p-6 mb-8">
            <div className="grid lg:grid-cols-2 gap-8">
              {/* Form */}
              <div className="space-y-6">
                <div>
                  <h3 className="font-semibold mb-4 flex items-center gap-2">
                    <UtensilsCrossed className="w-4 h-4" />
                    Restaurant Information
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="name">Restaurant Name *</Label>
                      <Input
                        id="name"
                        value={restaurant.name}
                        onChange={(e) => updateRestaurant("name", e.target.value)}
                        placeholder="e.g. Rizzolo"
                        data-testid="input-restaurant-name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="tagline">Tagline</Label>
                      <Input
                        id="tagline"
                        value={restaurant.tagline}
                        onChange={(e) => updateRestaurant("tagline", e.target.value)}
                        placeholder="e.g. Food & Drinks"
                        data-testid="input-restaurant-tagline"
                      />
                    </div>
                    <div>
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        value={restaurant.description}
                        onChange={(e) => updateRestaurant("description", e.target.value)}
                        placeholder="Our restaurant will give you the opportunity to taste the best dishes..."
                        rows={2}
                        data-testid="input-restaurant-description"
                      />
                    </div>
                  </div>
                </div>

                {/* Menu Categories */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold">Menu Categories</h3>
                    <Button size="sm" variant="outline" onClick={addCategory} data-testid="button-add-category">
                      <Plus className="w-4 h-4 mr-1" />
                      Add Category
                    </Button>
                  </div>

                  <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
                    {categories.map((category) => (
                      <div key={category.id} className="border rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-3">
                          <Input
                            value={category.name}
                            onChange={(e) => updateCategory(category.id, e.target.value)}
                            className="font-medium"
                            data-testid={`input-category-${category.id}`}
                          />
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => removeCategory(category.id)}
                            data-testid={`button-remove-category-${category.id}`}
                          >
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
                        </div>

                        <div className="space-y-2 pl-2">
                          {category.items.map((item) => (
                            <div key={item.id} className="flex items-center gap-2">
                              <Input
                                value={item.name}
                                onChange={(e) => updateItem(category.id, item.id, "name", e.target.value)}
                                placeholder="Item name"
                                className="flex-1"
                                data-testid={`input-item-name-${item.id}`}
                              />
                              <Input
                                value={item.price}
                                onChange={(e) => updateItem(category.id, item.id, "price", e.target.value)}
                                placeholder="$0.00"
                                className="w-24"
                                data-testid={`input-item-price-${item.id}`}
                              />
                              <Button
                                size="icon"
                                variant="ghost"
                                onClick={() => removeItem(category.id, item.id)}
                                data-testid={`button-remove-item-${item.id}`}
                              >
                                <Trash2 className="w-4 h-4 text-muted-foreground" />
                              </Button>
                            </div>
                          ))}
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => addItem(category.id)}
                            className="text-primary"
                            data-testid={`button-add-item-${category.id}`}
                          >
                            <Plus className="w-4 h-4 mr-1" />
                            Add Item
                          </Button>
                        </div>
                      </div>
                    ))}
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
                      <div className="bg-gray-700 text-white text-xs flex justify-between px-6 py-2">
                        <span>18:45</span>
                        <div className="flex gap-1 items-center">
                          <span>5G</span>
                          <div className="w-6 h-3 border border-white rounded-sm">
                            <div className="w-4 h-full bg-white rounded-sm" />
                          </div>
                        </div>
                      </div>

                      {/* Menu Preview */}
                      <div className="bg-gray-700 min-h-[420px]">
                        {/* Header */}
                        <div className="text-center py-6">
                          <div className="text-amber-100 text-xs tracking-widest mb-1">PREMIUM MENU</div>
                          <div className="text-2xl font-serif text-white font-bold">
                            {restaurant.name || "Restaurant"}
                          </div>
                          <div className="text-amber-200 text-xs tracking-wider mt-1">
                            {restaurant.tagline || "FOOD & DRINKS"}
                          </div>
                        </div>

                        {restaurant.description && (
                          <p className="text-white/70 text-center text-sm px-4 mb-4">
                            {restaurant.description}
                          </p>
                        )}

                        {/* Categories */}
                        <div className="bg-white rounded-t-3xl p-4 min-h-[240px] max-h-[280px] overflow-y-auto">
                          {categories.filter((c) => c.name).map((category) => (
                            <div key={category.id} className="mb-3">
                              <div className="flex items-center justify-between py-2 border-b border-amber-200">
                                <span className="font-semibold text-gray-800 text-sm">{category.name}</span>
                                <ChevronRight className="w-4 h-4 text-gray-400" />
                              </div>
                              {category.items.filter(item => item.name).length > 0 && (
                                <div className="py-1 space-y-1">
                                  {category.items.filter(item => item.name).slice(0, 3).map((item) => (
                                    <div key={item.id} className="flex justify-between text-xs text-gray-600 px-2">
                                      <span className="truncate max-w-[120px]">{item.name}</span>
                                      {item.price && <span className="text-amber-600 font-medium">{item.price}</span>}
                                    </div>
                                  ))}
                                  {category.items.filter(item => item.name).length > 3 && (
                                    <div className="text-[10px] text-gray-400 px-2">
                                      +{category.items.filter(item => item.name).length - 3} more...
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          ))}
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
                        Enter restaurant name to generate QR
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
