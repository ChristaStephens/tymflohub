import { useState } from "react";
import { Calculator } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import FAQ from "@/components/FAQ";
import SEO from "@/components/SEO";

interface ResultMetric {
  label: string;
  value: string;
  unit?: string;
  primary?: boolean;
}

export default function ProfitMargin() {
  const [cost, setCost] = useState("");
  const [price, setPrice] = useState("");
  const [results, setResults] = useState<ResultMetric[] | null>(null);

  const handleCalculate = (e: React.FormEvent) => {
    e.preventDefault();
    const costNum = parseFloat(cost);
    const priceNum = parseFloat(price);
    
    if (costNum > 0 && priceNum > 0) {
      const profit = priceNum - costNum;
      const margin = (profit / priceNum) * 100;
      const markup = (profit / costNum) * 100;

      setResults([
        { label: "Profit Margin", value: margin.toFixed(2), unit: "%", primary: true },
        { label: "Profit Amount", value: `$${profit.toFixed(2)}` },
        { label: "Markup", value: markup.toFixed(2), unit: "%" },
      ]);
    }
  };

  const faqItems = [
    {
      question: "What is profit margin?",
      answer: "Profit margin is the percentage of revenue that remains as profit after deducting costs. It's calculated as (Revenue - Cost) / Revenue × 100.",
    },
    {
      question: "How is profit margin different from markup?",
      answer: "Profit margin is based on the selling price, while markup is based on the cost. A 50% markup doesn't equal a 50% profit margin.",
    },
    {
      question: "What's a good profit margin?",
      answer: "A good profit margin varies by industry. Generally, 10-20% is healthy for most businesses, but this can be much higher or lower depending on your sector.",
    },
  ];

  return (
    <>
      <SEO
        title="Profit Margin Calculator - Free Online Tool | TymFlo Hub"
        description="Calculate profit margins, markup percentages, and profit amounts instantly. Free, fast, and accurate business calculator for pricing decisions."
        canonical="https://tymflohub.com/tools/profit-margin"
      />

      <div className="min-h-screen bg-gradient-to-b from-accent/20 to-background py-12">
        <div className="container mx-auto max-w-5xl px-6">
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-primary/70 mb-6">
              <Calculator className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-primary mb-4">
              Profit Margin Calculator
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Calculate your profit margin, markup percentage, and profit amount to make informed pricing decisions
            </p>
          </div>

          <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12 mb-12">
            <form onSubmit={handleCalculate} className="max-w-2xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                <div className="space-y-3">
                  <Label htmlFor="cost" className="text-base font-semibold text-primary">
                    Cost Price
                  </Label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground text-lg">
                      $
                    </span>
                    <Input
                      id="cost"
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={cost}
                      onChange={(e) => setCost(e.target.value)}
                      className="pl-8 h-14 text-lg rounded-xl border-2"
                      data-testid="input-cost"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <Label htmlFor="price" className="text-base font-semibold text-primary">
                    Selling Price
                  </Label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground text-lg">
                      $
                    </span>
                    <Input
                      id="price"
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      className="pl-8 h-14 text-lg rounded-xl border-2"
                      data-testid="input-price"
                    />
                  </div>
                </div>
              </div>

              <Button
                type="submit"
                size="lg"
                className="w-full h-14 text-lg rounded-xl"
                data-testid="button-calculate"
              >
                Calculate
              </Button>
            </form>

            {results && (
              <div className="mt-12 pt-12 border-t">
                <h3 className="text-2xl font-bold text-center text-primary mb-8">Results</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
                        <span className={`font-mono font-bold ${metric.primary ? "text-5xl text-primary" : "text-3xl"}`}>
                          {metric.value}
                        </span>
                        {metric.unit && (
                          <span className="text-2xl text-muted-foreground">{metric.unit}</span>
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
