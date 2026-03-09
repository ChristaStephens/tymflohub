import { useState } from "react";
import { Home } from "lucide-react";
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

export default function MortgageCalculator() {
  const [homePrice, setHomePrice] = useState("");
  const [downPayment, setDownPayment] = useState("");
  const [interestRate, setInterestRate] = useState("");
  const [loanTerm, setLoanTerm] = useState("");
  const [results, setResults] = useState<ResultMetric[] | null>(null);

  const handleCalculate = (e: React.FormEvent) => {
    e.preventDefault();
    const price = parseFloat(homePrice);
    const down = parseFloat(downPayment);
    const annualRate = parseFloat(interestRate);
    const years = parseFloat(loanTerm);
    
    if (price > 0 && down >= 0 && annualRate >= 0 && years > 0) {
      const loanAmount = price - down;
      const monthlyRate = annualRate / 100 / 12;
      const numPayments = years * 12;
      
      let monthlyPayment;
      if (monthlyRate === 0) {
        monthlyPayment = loanAmount / numPayments;
      } else {
        monthlyPayment = (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, numPayments)) / 
                        (Math.pow(1 + monthlyRate, numPayments) - 1);
      }
      
      const totalPayment = monthlyPayment * numPayments;
      const totalInterest = totalPayment - loanAmount;

      setResults([
        { label: "Monthly Payment", value: `$${monthlyPayment.toFixed(2)}`, primary: true },
        { label: "Loan Amount", value: `$${loanAmount.toFixed(2)}` },
        { label: "Total Interest", value: `$${totalInterest.toFixed(2)}` },
        { label: "Total Cost", value: `$${(price + totalInterest).toFixed(2)}` },
      ]);
    }
  };

  const faqItems = [
    {
      question: "What is included in a mortgage payment?",
      answer: "A typical mortgage payment includes principal, interest, property taxes, and homeowners insurance (PITI). This calculator focuses on principal and interest.",
    },
    {
      question: "How much should I put down on a home?",
      answer: "A 20% down payment is often recommended to avoid PMI (Private Mortgage Insurance), but many programs allow as little as 3-5% down. A larger down payment reduces your loan amount and monthly payments.",
    },
    {
      question: "What is a good mortgage interest rate?",
      answer: "Mortgage rates vary based on market conditions, your credit score, down payment, and loan type. Rates change frequently, so it's important to shop around and compare offers from multiple lenders.",
    },
    {
      question: "Should I choose a 15-year or 30-year mortgage?",
      answer: "A 15-year mortgage has higher monthly payments but lower total interest. A 30-year mortgage has lower monthly payments but higher total interest. Choose based on your budget and financial goals.",
    },
  ];

  return (
    <>
      <SEO
        title="Mortgage Calculator - Estimate Monthly Payments | TymFlo Hub"
        description="Calculate your mortgage payments with our free mortgage calculator. Estimate monthly payments, total interest, and total cost for your home purchase."
        canonical="https://tymflohub.com/tools/mortgage-calculator"
      />

      <div className="min-h-screen bg-gradient-to-b from-accent/20 to-background py-12">
        <div className="container mx-auto max-w-5xl px-6">
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-primary/70 mb-6">
              <Home className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-primary mb-4">
              Mortgage Calculator
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Estimate your monthly mortgage payments and see the total cost of your home purchase
            </p>
          </div>

          <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12 mb-12">
            <form onSubmit={handleCalculate} className="max-w-2xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                <div className="space-y-3">
                  <Label htmlFor="homePrice" className="text-base font-semibold text-primary">
                    Home Price
                  </Label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground text-lg">
                      $
                    </span>
                    <Input
                      id="homePrice"
                      type="number"
                      step="1000"
                      placeholder="300000"
                      value={homePrice}
                      onChange={(e) => setHomePrice(e.target.value)}
                      className="pl-8 h-14 text-lg rounded-xl border-2"
                      data-testid="input-home-price"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <Label htmlFor="downPayment" className="text-base font-semibold text-primary">
                    Down Payment
                  </Label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground text-lg">
                      $
                    </span>
                    <Input
                      id="downPayment"
                      type="number"
                      step="1000"
                      placeholder="60000"
                      value={downPayment}
                      onChange={(e) => setDownPayment(e.target.value)}
                      className="pl-8 h-14 text-lg rounded-xl border-2"
                      data-testid="input-down-payment"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <Label htmlFor="rate" className="text-base font-semibold text-primary">
                    Interest Rate
                  </Label>
                  <div className="relative">
                    <Input
                      id="rate"
                      type="number"
                      step="0.01"
                      placeholder="6.5"
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
                  <Label htmlFor="term" className="text-base font-semibold text-primary">
                    Loan Term (Years)
                  </Label>
                  <Input
                    id="term"
                    type="number"
                    step="1"
                    placeholder="30"
                    value={loanTerm}
                    onChange={(e) => setLoanTerm(e.target.value)}
                    className="h-14 text-lg rounded-xl border-2"
                    data-testid="input-loan-term"
                  />
                </div>
              </div>

              <Button
                type="submit"
                size="lg"
                className="w-full h-14 text-lg rounded-xl"
                data-testid="button-calculate"
              >
                Calculate Mortgage
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
                        <span className={`font-mono font-bold ${metric.primary ? "text-4xl text-primary" : "text-2xl"}`}>
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
