import { useState } from "react";
import { BarChart3 } from "lucide-react";
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

export default function Breakeven() {
  const [results, setResults] = useState<ResultMetric[] | null>(null);

  const handleCalculate = (values: Record<string, number>) => {
    const { fixedCosts, pricePerUnit, variableCostPerUnit } = values;
    if (fixedCosts > 0 && pricePerUnit > 0 && variableCostPerUnit >= 0) {
      const contributionMargin = pricePerUnit - variableCostPerUnit;
      if (contributionMargin > 0) {
        const breakEvenUnits = fixedCosts / contributionMargin;
        const breakEvenRevenue = breakEvenUnits * pricePerUnit;

        setResults([
          { label: "Break-Even Units", value: Math.ceil(breakEvenUnits).toString(), primary: true },
          { label: "Break-Even Revenue", value: `$${breakEvenRevenue.toFixed(2)}` },
          { label: "Contribution Margin", value: `$${contributionMargin.toFixed(2)}` },
        ]);
      }
    }
  };

  const faqItems = [
    {
      question: "What is the break-even point?",
      answer: "The break-even point is when your total revenue equals total costs, meaning you're not making a profit or loss. It shows how many units you need to sell to cover all expenses.",
    },
    {
      question: "What are fixed costs?",
      answer: "Fixed costs are expenses that don't change with production volume, like rent, salaries, and insurance.",
    },
    {
      question: "What are variable costs?",
      answer: "Variable costs change with production volume, such as materials, packaging, and direct labor per unit.",
    },
  ];

  return (
    <>
      <SEO
        title="Break-Even Calculator - TymFlo Hub"
        description="Calculate your break-even point to know how many units to sell to cover costs. Free break-even analysis tool."
        canonical="https://tymflohub.com/tools/breakeven"
      />

      <div className="py-12 bg-background min-h-[calc(100vh-4rem)]">
        <div className="container mx-auto max-w-6xl px-4">
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-primary" />
              </div>
              <h1 className="text-3xl font-bold">Break-Even Calculator</h1>
            </div>
            <p className="text-lg text-muted-foreground max-w-2xl">
              Find out how many units you need to sell to cover your costs and start making a profit.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
              <CalculatorForm
                fields={[
                  { name: "fixedCosts", label: "Fixed Costs", placeholder: "0.00", prefix: "$" },
                  { name: "pricePerUnit", label: "Price Per Unit", placeholder: "0.00", prefix: "$" },
                  { name: "variableCostPerUnit", label: "Variable Cost Per Unit", placeholder: "0.00", prefix: "$" },
                ]}
                onCalculate={handleCalculate}
              />
            </div>

            <div>
              <ResultPanel results={results} emptyMessage="Enter your costs to calculate break-even point" />
            </div>
          </div>

          <FAQ items={faqItems} />
        </div>
      </div>
    </>
  );
}
