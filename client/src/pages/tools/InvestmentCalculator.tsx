import { useState } from "react";
import { TrendingUp } from "lucide-react";
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

export default function InvestmentCalculator() {
  const [initialInvestment, setInitialInvestment] = useState("");
  const [monthlyContribution, setMonthlyContribution] = useState("");
  const [annualReturn, setAnnualReturn] = useState("");
  const [years, setYears] = useState("");
  const [results, setResults] = useState<ResultMetric[] | null>(null);

  const handleCalculate = (e: React.FormEvent) => {
    e.preventDefault();
    const initial = parseFloat(initialInvestment);
    const monthly = parseFloat(monthlyContribution);
    const rate = parseFloat(annualReturn);
    const period = parseFloat(years);
    
    if (initial >= 0 && monthly >= 0 && rate >= 0 && period > 0) {
      const monthlyRate = rate / 100 / 12;
      const months = period * 12;
      
      // Future value of initial investment
      const fvInitial = initial * Math.pow(1 + monthlyRate, months);
      
      // Future value of monthly contributions
      let fvContributions = 0;
      if (monthlyRate === 0) {
        fvContributions = monthly * months;
      } else {
        fvContributions = monthly * ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate);
      }
      
      const totalValue = fvInitial + fvContributions;
      const totalContributed = initial + (monthly * months);
      const totalEarnings = totalValue - totalContributed;
      const returnPercent = totalContributed > 0 ? (totalEarnings / totalContributed) * 100 : 0;

      setResults([
        { label: "Future Value", value: `$${totalValue.toFixed(2)}`, primary: true },
        { label: "Total Contributed", value: `$${totalContributed.toFixed(2)}` },
        { label: "Total Earnings", value: `$${totalEarnings.toFixed(2)}` },
        { label: "Return on Investment", value: returnPercent.toFixed(2), unit: "%" },
      ]);
    }
  };

  const faqItems = [
    {
      question: "How does compound growth work?",
      answer: "Compound growth means your investment earns returns on both your initial investment and your accumulated earnings. Over time, this compounding effect significantly accelerates growth.",
    },
    {
      question: "What is a realistic annual return rate?",
      answer: "Historical stock market returns average around 10% annually, but this varies greatly. Conservative estimates use 6-8% for diversified portfolios. Always consider inflation and risk.",
    },
    {
      question: "How much should I invest monthly?",
      answer: "Financial experts often recommend investing 15-20% of your gross income. Start with what you can afford and increase gradually as your income grows.",
    },
    {
      question: "Should I invest a lump sum or contribute monthly?",
      answer: "Both strategies have merit. Monthly contributions (dollar-cost averaging) reduce timing risk, while lump sum investing can maximize time in the market. Consider your risk tolerance and financial situation.",
    },
  ];

  return (
    <>
      <SEO
        title="Investment Calculator - Calculate Future Value | TymFlo Hub"
        description="Calculate investment growth with our free investment calculator. Project future value, earnings, and ROI for your investment portfolio."
        canonical="https://tymflohub.com/tools/investment-calculator"
      />

      <div className="min-h-screen bg-gradient-to-b from-accent/20 to-background py-12">
        <div className="container mx-auto max-w-5xl px-6">
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-primary/70 mb-6">
              <TrendingUp className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-primary mb-4">
              Investment Calculator
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Calculate how your investments will grow over time with compound returns
            </p>
          </div>

          <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12 mb-12">
            <form onSubmit={handleCalculate} className="max-w-2xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                <div className="space-y-3">
                  <Label htmlFor="initial" className="text-base font-semibold text-primary">
                    Initial Investment
                  </Label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground text-lg">
                      $
                    </span>
                    <Input
                      id="initial"
                      type="number"
                      step="0.01"
                      placeholder="10000"
                      value={initialInvestment}
                      onChange={(e) => setInitialInvestment(e.target.value)}
                      className="pl-8 h-14 text-lg rounded-xl border-2"
                      data-testid="input-initial-investment"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <Label htmlFor="monthly" className="text-base font-semibold text-primary">
                    Monthly Contribution
                  </Label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground text-lg">
                      $
                    </span>
                    <Input
                      id="monthly"
                      type="number"
                      step="0.01"
                      placeholder="500"
                      value={monthlyContribution}
                      onChange={(e) => setMonthlyContribution(e.target.value)}
                      className="pl-8 h-14 text-lg rounded-xl border-2"
                      data-testid="input-monthly-contribution"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <Label htmlFor="return" className="text-base font-semibold text-primary">
                    Expected Annual Return
                  </Label>
                  <div className="relative">
                    <Input
                      id="return"
                      type="number"
                      step="0.1"
                      placeholder="8"
                      value={annualReturn}
                      onChange={(e) => setAnnualReturn(e.target.value)}
                      className="pr-12 h-14 text-lg rounded-xl border-2"
                      data-testid="input-annual-return"
                    />
                    <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-muted-foreground text-lg">
                      %
                    </span>
                  </div>
                </div>

                <div className="space-y-3">
                  <Label htmlFor="years" className="text-base font-semibold text-primary">
                    Investment Period (Years)
                  </Label>
                  <Input
                    id="years"
                    type="number"
                    step="1"
                    placeholder="20"
                    value={years}
                    onChange={(e) => setYears(e.target.value)}
                    className="h-14 text-lg rounded-xl border-2"
                    data-testid="input-years"
                  />
                </div>
              </div>

              <Button
                type="submit"
                size="lg"
                className="w-full h-14 text-lg rounded-xl"
                data-testid="button-calculate"
              >
                Calculate Investment
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
