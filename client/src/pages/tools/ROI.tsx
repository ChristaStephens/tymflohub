import { useState } from "react";
import { Calculator } from "lucide-react";
import CalculatorForm from "@/components/CalculatorForm";
import ResultPanel from "@/components/ResultPanel";
import FAQ from "@/components/FAQ";
import SEO from "@/components/SEO";

interface ResultMetric {
  label: string;
  value: string;
  unit?: string;
  primary?: boolean;
}

export default function ROI() {
  const [results, setResults] = useState<ResultMetric[] | null>(null);

  const handleCalculate = (values: Record<string, number>) => {
    const { investment, returns } = values;
    if (investment > 0 && returns >= 0) {
      const netProfit = returns - investment;
      const roi = (netProfit / investment) * 100;

      setResults([
        { label: "ROI", value: roi.toFixed(2), unit: "%", primary: true },
        { label: "Net Profit", value: `$${netProfit.toFixed(2)}` },
        { label: "Total Returns", value: `$${returns.toFixed(2)}` },
      ]);
    }
  };

  const faqItems = [
    {
      question: "What is ROI?",
      answer: "ROI (Return on Investment) measures the profitability of an investment. It's calculated as (Returns - Investment) / Investment × 100.",
    },
    {
      question: "What's a good ROI?",
      answer: "A good ROI varies by industry and investment type. Generally, a positive ROI is good, but compare it to alternative investments and industry benchmarks.",
    },
    {
      question: "How do I improve my ROI?",
      answer: "You can improve ROI by increasing returns (revenue, efficiency) or decreasing investment costs, or both.",
    },
  ];

  return (
    <>
      <SEO
        title="ROI Calculator - TymFlo Hub"
        description="Calculate return on investment (ROI) to measure profitability. Free ROI calculator for business decisions."
        canonical="https://tymflohub.com/tools/roi"
      />

      <div className="py-12 bg-background min-h-[calc(100vh-4rem)]">
        <div className="container mx-auto max-w-6xl px-4">
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <Calculator className="w-6 h-6 text-primary" />
              </div>
              <h1 className="text-3xl font-bold">ROI Calculator</h1>
            </div>
            <p className="text-lg text-muted-foreground max-w-2xl">
              Calculate your return on investment to make smarter business decisions and evaluate profitability.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
              <CalculatorForm
                fields={[
                  { name: "investment", label: "Initial Investment", placeholder: "0.00", prefix: "$" },
                  { name: "returns", label: "Total Returns", placeholder: "0.00", prefix: "$" },
                ]}
                onCalculate={handleCalculate}
              />
            </div>

            <div>
              <ResultPanel results={results} emptyMessage="Enter investment details to calculate ROI" />
            </div>
          </div>

          <FAQ items={faqItems} />
        </div>
      </div>
    </>
  );
}
