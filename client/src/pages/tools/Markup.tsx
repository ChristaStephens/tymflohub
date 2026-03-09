import { useState } from "react";
import { TrendingUp } from "lucide-react";
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

export default function Markup() {
  const [results, setResults] = useState<ResultMetric[] | null>(null);

  const handleCalculate = (values: Record<string, number>) => {
    const { cost, price } = values;
    if (cost > 0 && price > 0) {
      const profit = price - cost;
      const markup = (profit / cost) * 100;
      const margin = (profit / price) * 100;

      setResults([
        { label: "Markup", value: markup.toFixed(2), unit: "%", primary: true },
        { label: "Profit Amount", value: `$${profit.toFixed(2)}` },
        { label: "Profit Margin", value: margin.toFixed(2), unit: "%" },
      ]);
    }
  };

  const faqItems = [
    {
      question: "What is markup?",
      answer: "Markup is the percentage added to the cost price to determine the selling price. It's calculated as (Selling Price - Cost) / Cost × 100.",
    },
    {
      question: "How do I use markup in pricing?",
      answer: "Multiply your cost by (1 + markup%) to get your selling price. For example, with a 50% markup, a $10 item would sell for $15.",
    },
    {
      question: "What's the difference between markup and margin?",
      answer: "Markup is based on cost, while margin is based on selling price. A 100% markup equals a 50% margin.",
    },
  ];

  return (
    <>
      <SEO
        title="Markup Calculator - TymFlo Hub"
        description="Calculate markup percentages and pricing instantly. Free markup calculator for business pricing decisions."
        canonical="https://tymflohub.com/tools/markup"
      />

      <div className="py-12 bg-background min-h-[calc(100vh-4rem)]">
        <div className="container mx-auto max-w-6xl px-4">
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-primary" />
              </div>
              <h1 className="text-3xl font-bold">Markup Calculator</h1>
            </div>
            <p className="text-lg text-muted-foreground max-w-2xl">
              Determine the right markup percentage for your products and services to ensure profitability.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
              <CalculatorForm
                fields={[
                  { name: "cost", label: "Cost Price", placeholder: "0.00", prefix: "$" },
                  { name: "price", label: "Selling Price", placeholder: "0.00", prefix: "$" },
                ]}
                onCalculate={handleCalculate}
              />
            </div>

            <div>
              <ResultPanel results={results} />
            </div>
          </div>

          <FAQ items={faqItems} />
        </div>
      </div>
    </>
  );
}
