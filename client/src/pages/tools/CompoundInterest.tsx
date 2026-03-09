import { useState } from "react";
import { Percent } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import FAQ from "@/components/FAQ";
import SEO from "@/components/SEO";

interface ResultMetric {
  label: string;
  value: string;
  unit?: string;
  primary?: boolean;
}

export default function CompoundInterest() {
  const [principal, setPrincipal] = useState("");
  const [interestRate, setInterestRate] = useState("");
  const [years, setYears] = useState("");
  const [compoundFrequency, setCompoundFrequency] = useState("12");
  const [results, setResults] = useState<ResultMetric[] | null>(null);

  const handleCalculate = (e: React.FormEvent) => {
    e.preventDefault();
    const p = parseFloat(principal);
    const r = parseFloat(interestRate) / 100;
    const t = parseFloat(years);
    const n = parseInt(compoundFrequency);
    
    if (p > 0 && r >= 0 && t > 0 && n > 0) {
      // A = P(1 + r/n)^(nt)
      const amount = p * Math.pow(1 + r / n, n * t);
      const interest = amount - p;
      const effectiveRate = (Math.pow(1 + r / n, n) - 1) * 100;

      setResults([
        { label: "Future Value", value: `$${amount.toFixed(2)}`, primary: true },
        { label: "Total Interest Earned", value: `$${interest.toFixed(2)}` },
        { label: "Effective Annual Rate", value: effectiveRate.toFixed(2), unit: "%" },
      ]);
    }
  };

  const faqItems = [
    {
      question: "What is compound interest?",
      answer: "Compound interest is interest calculated on both the initial principal and the accumulated interest from previous periods. It's often called 'interest on interest' and leads to exponential growth.",
    },
    {
      question: "How does compounding frequency affect growth?",
      answer: "More frequent compounding (daily vs. annually) results in slightly higher returns because interest is calculated and added to the principal more often, allowing it to grow faster.",
    },
    {
      question: "What's the difference between simple and compound interest?",
      answer: "Simple interest is calculated only on the principal amount, while compound interest is calculated on the principal plus accumulated interest. Compound interest grows much faster over time.",
    },
    {
      question: "What is the effective annual rate?",
      answer: "The effective annual rate (EAR) is the actual annual rate of return after accounting for compounding. It's useful for comparing investments with different compounding frequencies.",
    },
  ];

  return (
    <>
      <SEO
        title="Compound Interest Calculator - Calculate Growth | TymFlo Hub"
        description="Calculate compound interest with our free calculator. See how your money grows with different interest rates and compounding frequencies."
        canonical="https://tymflohub.com/tools/compound-interest"
      />

      <div className="min-h-screen bg-gradient-to-b from-accent/20 to-background py-12">
        <div className="container mx-auto max-w-5xl px-6">
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-primary/70 mb-6">
              <Percent className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-primary mb-4">
              Compound Interest Calculator
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Calculate how your savings grow with compound interest over time
            </p>
          </div>

          <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12 mb-12">
            <form onSubmit={handleCalculate} className="max-w-2xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                <div className="space-y-3">
                  <Label htmlFor="principal" className="text-base font-semibold text-primary">
                    Initial Deposit
                  </Label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground text-lg">
                      $
                    </span>
                    <Input
                      id="principal"
                      type="number"
                      step="0.01"
                      placeholder="5000"
                      value={principal}
                      onChange={(e) => setPrincipal(e.target.value)}
                      className="pl-8 h-14 text-lg rounded-xl border-2"
                      data-testid="input-principal"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <Label htmlFor="rate" className="text-base font-semibold text-primary">
                    Annual Interest Rate
                  </Label>
                  <div className="relative">
                    <Input
                      id="rate"
                      type="number"
                      step="0.1"
                      placeholder="4.5"
                      value={interestRate}
                      onChange={(e) => setInterestRate(e.target.value)}
                      className="pr-12 h-14 text-lg rounded-xl border-2"
                      data-testid="input-interest-rate"
                    />
                    <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-muted-foreground text-lg">
                      %
                    </span>
                  </div>
                </div>

                <div className="space-y-3">
                  <Label htmlFor="years" className="text-base font-semibold text-primary">
                    Time Period (Years)
                  </Label>
                  <Input
                    id="years"
                    type="number"
                    step="0.5"
                    placeholder="10"
                    value={years}
                    onChange={(e) => setYears(e.target.value)}
                    className="h-14 text-lg rounded-xl border-2"
                    data-testid="input-years"
                  />
                </div>

                <div className="space-y-3">
                  <Label htmlFor="frequency" className="text-base font-semibold text-primary">
                    Compounding Frequency
                  </Label>
                  <Select value={compoundFrequency} onValueChange={setCompoundFrequency}>
                    <SelectTrigger className="h-14 text-lg rounded-xl border-2" data-testid="select-frequency">
                      <SelectValue placeholder="Select frequency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">Annually</SelectItem>
                      <SelectItem value="2">Semi-Annually</SelectItem>
                      <SelectItem value="4">Quarterly</SelectItem>
                      <SelectItem value="12">Monthly</SelectItem>
                      <SelectItem value="52">Weekly</SelectItem>
                      <SelectItem value="365">Daily</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button
                type="submit"
                size="lg"
                className="w-full h-14 text-lg rounded-xl"
                data-testid="button-calculate"
              >
                Calculate Compound Interest
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
                        <span className={`font-mono font-bold ${metric.primary ? "text-4xl text-primary" : "text-3xl"}`}>
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
