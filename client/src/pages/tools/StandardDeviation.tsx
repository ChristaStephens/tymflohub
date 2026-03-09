import { useState } from "react";
import { Sigma } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import FAQ from "@/components/FAQ";
import SEO from "@/components/SEO";

interface ResultMetric {
  label: string;
  value: string;
  unit?: string;
  primary?: boolean;
}

export default function StandardDeviation() {
  const [numbers, setNumbers] = useState("");
  const [populationType, setPopulationType] = useState<"sample" | "population">("sample");
  const [results, setResults] = useState<ResultMetric[] | null>(null);

  const handleCalculate = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Parse numbers from input
    const nums = numbers
      .split(/[,\s\n]+/)
      .map(n => parseFloat(n.trim()))
      .filter(n => !isNaN(n));
    
    if (nums.length > 0) {
      // Calculate Mean
      const mean = nums.reduce((sum, num) => sum + num, 0) / nums.length;
      
      // Calculate variance
      const squaredDiffs = nums.map(num => Math.pow(num - mean, 2));
      const variance = squaredDiffs.reduce((sum, diff) => sum + diff, 0) / 
                      (populationType === "sample" ? nums.length - 1 : nums.length);
      
      // Calculate standard deviation
      const stdDev = Math.sqrt(variance);

      setResults([
        { label: "Standard Deviation", value: stdDev.toFixed(4), primary: true },
        { label: "Variance", value: variance.toFixed(4) },
        { label: "Mean", value: mean.toFixed(4) },
        { label: "Count", value: nums.length.toString() },
      ]);
    }
  };

  const faqItems = [
    {
      question: "What is standard deviation?",
      answer: "Standard deviation measures how spread out numbers are from their average. A low standard deviation means numbers are close to the mean, while a high standard deviation means they're more spread out.",
    },
    {
      question: "What's the difference between sample and population?",
      answer: "Use 'Sample' when your data is a subset of a larger group (divides by n-1). Use 'Population' when you have data for the entire group (divides by n). Sample is more common in statistics.",
    },
    {
      question: "What is variance?",
      answer: "Variance is the average of the squared differences from the mean. Standard deviation is the square root of variance and is expressed in the same units as the original data.",
    },
    {
      question: "How do I interpret standard deviation?",
      answer: "In a normal distribution, about 68% of values fall within 1 standard deviation of the mean, 95% within 2 standard deviations, and 99.7% within 3 standard deviations.",
    },
  ];

  return (
    <>
      <SEO
        title="Standard Deviation Calculator - Variance & SD | TymFlo Hub"
        description="Calculate standard deviation and variance for your data set. Free online statistics calculator for sample and population data."
        canonical="https://tymflohub.com/tools/standard-deviation"
      />

      <div className="min-h-screen bg-gradient-to-b from-accent/20 to-background py-12">
        <div className="container mx-auto max-w-5xl px-6">
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-primary/70 mb-6">
              <Sigma className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-primary mb-4">
              Standard Deviation Calculator
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Calculate standard deviation, variance, and other statistical measures
            </p>
          </div>

          <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12 mb-12">
            <form onSubmit={handleCalculate} className="max-w-2xl mx-auto">
              <div className="space-y-6 mb-8">
                <div className="space-y-3">
                  <Label htmlFor="numbers" className="text-base font-semibold text-primary">
                    Enter Numbers (comma, space, or line separated)
                  </Label>
                  <Textarea
                    id="numbers"
                    placeholder="2, 4, 6, 8, 10, 12, 14"
                    value={numbers}
                    onChange={(e) => setNumbers(e.target.value)}
                    className="min-h-32 text-lg rounded-xl border-2 resize-none"
                    data-testid="input-numbers"
                  />
                  <p className="text-sm text-muted-foreground">
                    Example: 5, 10, 15, 20 or 5 10 15 20 or one number per line
                  </p>
                </div>

                <div className="space-y-3">
                  <Label className="text-base font-semibold text-primary">
                    Data Type
                  </Label>
                  <Tabs value={populationType} onValueChange={(v) => setPopulationType(v as "sample" | "population")}>
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="sample" data-testid="tab-sample">Sample</TabsTrigger>
                      <TabsTrigger value="population" data-testid="tab-population">Population</TabsTrigger>
                    </TabsList>
                    <TabsContent value="sample" className="text-sm text-muted-foreground mt-3">
                      Use this when your data is a subset of a larger group (most common)
                    </TabsContent>
                    <TabsContent value="population" className="text-sm text-muted-foreground mt-3">
                      Use this when you have data for the entire group
                    </TabsContent>
                  </Tabs>
                </div>
              </div>

              <Button
                type="submit"
                size="lg"
                className="w-full h-14 text-lg rounded-xl"
                data-testid="button-calculate"
              >
                Calculate Standard Deviation
              </Button>
            </form>

            {results && (
              <div className="mt-12 pt-12 border-t">
                <h3 className="text-2xl font-bold text-center text-primary mb-8">Results</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {results.map((metric, index) => (
                    <div
                      key={index}
                      className={`text-center p-6 rounded-2xl ${
                        metric.primary
                          ? "bg-gradient-to-br from-primary/10 to-accent/10 border-2 border-primary/20"
                          : "bg-muted/50"
                      }`}
                      data-testid={`result-${metric.label.toLowerCase().replace(/\s+/g, '-')}`}
                    >
                      <div className="text-sm text-muted-foreground font-medium mb-2 uppercase tracking-wide">
                        {metric.label}
                      </div>
                      <div className="flex items-baseline justify-center gap-2">
                        <span className={`font-mono font-bold ${metric.primary ? "text-3xl text-primary" : "text-2xl"}`}>
                          {metric.value}
                        </span>
                        {metric.unit && (
                          <span className="text-xl text-muted-foreground">{metric.unit}</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <FAQ items={faqItems} />
        </div>
      </div>
    </>
  );
}
