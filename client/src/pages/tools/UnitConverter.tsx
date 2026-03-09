import { useState, useEffect } from "react";
import { Ruler, ArrowLeftRight, Shield, Zap, Globe, Lock, CheckCircle, RefreshCw } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import SEO from "@/components/SEO";
import { HowItWorks, Features, FAQSection, BenefitsBanner } from "@/components/SEOContent";

const conversions = {
  length: {
    name: "Length",
    units: [
      { code: "m", name: "Meters", toBase: 1 },
      { code: "km", name: "Kilometers", toBase: 1000 },
      { code: "cm", name: "Centimeters", toBase: 0.01 },
      { code: "mm", name: "Millimeters", toBase: 0.001 },
      { code: "mi", name: "Miles", toBase: 1609.34 },
      { code: "yd", name: "Yards", toBase: 0.9144 },
      { code: "ft", name: "Feet", toBase: 0.3048 },
      { code: "in", name: "Inches", toBase: 0.0254 },
    ],
  },
  weight: {
    name: "Weight",
    units: [
      { code: "kg", name: "Kilograms", toBase: 1 },
      { code: "g", name: "Grams", toBase: 0.001 },
      { code: "mg", name: "Milligrams", toBase: 0.000001 },
      { code: "lb", name: "Pounds", toBase: 0.453592 },
      { code: "oz", name: "Ounces", toBase: 0.0283495 },
      { code: "ton", name: "Metric Tons", toBase: 1000 },
    ],
  },
  temperature: {
    name: "Temperature",
    units: [
      { code: "C", name: "Celsius" },
      { code: "F", name: "Fahrenheit" },
      { code: "K", name: "Kelvin" },
    ],
  },
  volume: {
    name: "Volume",
    units: [
      { code: "l", name: "Liters", toBase: 1 },
      { code: "ml", name: "Milliliters", toBase: 0.001 },
      { code: "gal", name: "Gallons (US)", toBase: 3.78541 },
      { code: "qt", name: "Quarts", toBase: 0.946353 },
      { code: "pt", name: "Pints", toBase: 0.473176 },
      { code: "cup", name: "Cups", toBase: 0.236588 },
      { code: "floz", name: "Fluid Ounces", toBase: 0.0295735 },
    ],
  },
};

export default function UnitConverter() {
  const [category, setCategory] = useState<keyof typeof conversions>("length");
  const [amount, setAmount] = useState<string>("1");
  const [fromUnit, setFromUnit] = useState<string>("m");
  const [toUnit, setToUnit] = useState<string>("ft");
  const [result, setResult] = useState<number | null>(null);

  const convert = () => {
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount)) return;

    const currentCategory = conversions[category];
    
    if (category === "temperature") {
      // Special handling for temperature
      let tempInCelsius = numAmount;
      
      // Convert from source to Celsius
      if (fromUnit === "F") {
        tempInCelsius = (numAmount - 32) * 5/9;
      } else if (fromUnit === "K") {
        tempInCelsius = numAmount - 273.15;
      }
      
      // Convert from Celsius to target
      let result = tempInCelsius;
      if (toUnit === "F") {
        result = (tempInCelsius * 9/5) + 32;
      } else if (toUnit === "K") {
        result = tempInCelsius + 273.15;
      }
      
      setResult(result);
    } else {
      // Regular conversion for length, weight, volume
      const fromUnitData = currentCategory.units.find(u => u.code === fromUnit);
      const toUnitData = currentCategory.units.find(u => u.code === toUnit);
      
      if (fromUnitData && toUnitData && 'toBase' in fromUnitData && 'toBase' in toUnitData) {
        const fromBase = fromUnitData.toBase as number;
        const toBase = toUnitData.toBase as number;
        const baseValue = numAmount * fromBase;
        const converted = baseValue / toBase;
        setResult(converted);
      }
    }
  };

  useEffect(() => {
    if (amount && parseFloat(amount)) {
      convert();
    }
  }, [amount, fromUnit, toUnit, category]);

  useEffect(() => {
    // Reset units when category changes
    const units = conversions[category].units;
    setFromUnit(units[0].code);
    setToUnit(units[Math.min(1, units.length - 1)].code);
  }, [category]);

  const howItWorksSteps = [
    {
      step: 1,
      title: "Select Category",
      description: "Choose from Length, Weight, Temperature, or Volume conversion.",
    },
    {
      step: 2,
      title: "Enter Amount",
      description: "Type the value you want to convert. Results update automatically.",
    },
    {
      step: 3,
      title: "Get Results",
      description: "See instant conversion results. Select different units to compare.",
    },
  ];

  const features = [
    {
      icon: <RefreshCw className="w-6 h-6" />,
      title: "Instant Conversion",
      description: "Results update automatically as you type. No button clicking needed.",
    },
    {
      icon: <Ruler className="w-6 h-6" />,
      title: "4 Categories",
      description: "Convert length, weight, temperature, and volume measurements.",
    },
    {
      icon: <Zap className="w-6 h-6" />,
      title: "Fast & Accurate",
      description: "Precise conversions using standard conversion formulas.",
    },
    {
      icon: <Globe className="w-6 h-6" />,
      title: "Multiple Units",
      description: "Support for metric and imperial units in all categories.",
    },
    {
      icon: <Lock className="w-6 h-6" />,
      title: "No Registration",
      description: "Free to use without account. Start converting immediately.",
    },
    {
      icon: <CheckCircle className="w-6 h-6" />,
      title: "Always Free",
      description: "Unit conversion is completely free with unlimited conversions.",
    },
  ];

  const faqItems = [
    {
      question: "Which units can I convert?",
      answer: "Length: meters, kilometers, miles, feet, inches, yards, centimeters, millimeters. Weight: kilograms, grams, pounds, ounces, metric tons, milligrams. Temperature: Celsius, Fahrenheit, Kelvin. Volume: liters, milliliters, gallons, quarts, pints, cups, fluid ounces.",
    },
    {
      question: "Is the unit converter accurate?",
      answer: "Yes! We use standard conversion formulas and provide results to 4 decimal places for precision. Temperature conversions account for offset differences, not just ratios.",
    },
    {
      question: "How do I convert temperature?",
      answer: "Select the Temperature tab, enter your value, choose your from unit (C, F, or K), and select your to unit. The conversion happens automatically.",
    },
    {
      question: "Can I convert between metric and imperial?",
      answer: "Absolutely! All categories support both metric and imperial units. Convert between kilograms and pounds, meters and feet, liters and gallons, and more.",
    },
    {
      question: "Is this tool free to use?",
      answer: "Yes! The unit converter is completely free with unlimited conversions. No registration or payment required.",
    },
  ];

  return (
    <>
      <SEO
        title="Unit Converter - Length, Weight, Temperature & More | TymFlo Hub"
        description="Free unit converter for length, weight, temperature, and volume. Convert meters to feet, kg to pounds, Celsius to Fahrenheit, and more."
      />

      <div className="min-h-screen bg-gradient-to-b from-accent/30 to-background py-12">
        <div className="container mx-auto max-w-4xl px-6">
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-600 mb-6">
              <Ruler className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-primary mb-4">
              Unit Converter
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Convert between different units of length, weight, temperature, and volume.
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Convert Units</CardTitle>
              <CardDescription>
                Select a category and enter values to convert
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs value={category} onValueChange={(v) => setCategory(v as keyof typeof conversions)}>
                <TabsList className="grid w-full grid-cols-4 mb-6">
                  <TabsTrigger value="length" data-testid="tab-length">Length</TabsTrigger>
                  <TabsTrigger value="weight" data-testid="tab-weight">Weight</TabsTrigger>
                  <TabsTrigger value="temperature" data-testid="tab-temperature">Temperature</TabsTrigger>
                  <TabsTrigger value="volume" data-testid="tab-volume">Volume</TabsTrigger>
                </TabsList>

                {Object.entries(conversions).map(([key, data]) => (
                  <TabsContent key={key} value={key} className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="amount">Amount</Label>
                      <Input
                        id="amount"
                        type="number"
                        placeholder="Enter amount"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        step="0.01"
                        className="text-lg"
                        data-testid="input-amount"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-4 items-end">
                      <div className="space-y-2">
                        <Label htmlFor="from-unit">From</Label>
                        <Select value={fromUnit} onValueChange={setFromUnit}>
                          <SelectTrigger id="from-unit" data-testid="select-from-unit">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {data.units.map((unit) => (
                              <SelectItem key={unit.code} value={unit.code}>
                                {unit.name} ({unit.code})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <ArrowLeftRight className="w-4 h-4 text-muted-foreground mb-3" />

                      <div className="space-y-2">
                        <Label htmlFor="to-unit">To</Label>
                        <Select value={toUnit} onValueChange={setToUnit}>
                          <SelectTrigger id="to-unit" data-testid="select-to-unit">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {data.units.map((unit) => (
                              <SelectItem key={unit.code} value={unit.code}>
                                {unit.name} ({unit.code})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {result !== null && (
                      <div className="mt-8 p-6 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 rounded-xl border-2 border-amber-200 dark:border-amber-800">
                        <div className="text-center">
                          <p className="text-sm text-muted-foreground mb-2">
                            {amount} {fromUnit} =
                          </p>
                          <p className="text-4xl font-bold text-primary" data-testid="text-result">
                            {result.toFixed(4)} {toUnit}
                          </p>
                        </div>
                      </div>
                    )}
                  </TabsContent>
                ))}
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>

      <HowItWorks title="How to Use the Unit Converter" steps={howItWorksSteps} />

      <Features title="Why Choose TymFlo Unit Converter?" features={features} />

      <FAQSection title="Unit Conversion FAQs" faqs={faqItems} />

      <BenefitsBanner
        title="Need More Conversion Tools?"
        description="Access currency converter, timezone converter, and all business calculators with TymFlo Hub. Completely free!"
        ctaText="Explore All Tools"
        ctaHref="/"
      />
    </>
  );
}
