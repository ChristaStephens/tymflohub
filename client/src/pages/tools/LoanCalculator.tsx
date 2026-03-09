import { useState } from "react";
import { DollarSign } from "lucide-react";
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

export default function LoanCalculator() {
  const [principal, setPrincipal] = useState("");
  const [interestRate, setInterestRate] = useState("");
  const [loanTerm, setLoanTerm] = useState("");
  const [results, setResults] = useState<ResultMetric[] | null>(null);

  const handleCalculate = (e: React.FormEvent) => {
    e.preventDefault();
    const p = parseFloat(principal);
    const annualRate = parseFloat(interestRate);
    const years = parseFloat(loanTerm);
    
    if (p > 0 && annualRate >= 0 && years > 0) {
      const monthlyRate = annualRate / 100 / 12;
      const numPayments = years * 12;
      
      let monthlyPayment;
      if (monthlyRate === 0) {
        monthlyPayment = p / numPayments;
      } else {
        monthlyPayment = (p * monthlyRate * Math.pow(1 + monthlyRate, numPayments)) / 
                        (Math.pow(1 + monthlyRate, numPayments) - 1);
      }
      
      const totalPayment = monthlyPayment * numPayments;
      const totalInterest = totalPayment - p;

      setResults([
        { label: "Monthly Payment", value: `$${monthlyPayment.toFixed(2)}`, primary: true },
        { label: "Total Payment", value: `$${totalPayment.toFixed(2)}` },
        { label: "Total Interest", value: `$${totalInterest.toFixed(2)}` },
      ]);
    }
  };

  const faqItems = [
    {
      question: "How is my monthly loan payment calculated?",
      answer: "Monthly payment is calculated using the loan amount, interest rate, and loan term. The formula accounts for both principal and interest to ensure the loan is fully paid off by the end of the term.",
    },
    {
      question: "What is the difference between fixed and variable interest rates?",
      answer: "A fixed interest rate stays the same throughout the loan term, while a variable rate can change based on market conditions. This calculator assumes a fixed rate.",
    },
    {
      question: "Should I make a larger down payment?",
      answer: "A larger down payment reduces your loan amount, monthly payment, and total interest paid. It can also help you qualify for better interest rates.",
    },
    {
      question: "How can I pay off my loan faster?",
      answer: "Making extra payments toward the principal, paying bi-weekly instead of monthly, or refinancing to a shorter term can help you pay off your loan faster and save on interest.",
    },
  ];

  return (
    <>
      <SEO
        title="Loan Calculator - Calculate Monthly Payments | TymFlo Hub"
        description="Calculate your loan payments with our free loan calculator. Estimate monthly payments, total interest, and total cost for any loan amount."
        canonical="https://tymflohub.com/tools/loan-calculator"
      />

      <div className="min-h-screen bg-gradient-to-b from-accent/20 to-background py-12">
        <div className="container mx-auto max-w-5xl px-6">
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-primary/70 mb-6">
              <DollarSign className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-primary mb-4">
              Loan Calculator
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Calculate your monthly loan payments, total interest, and total cost with our easy-to-use loan calculator
            </p>
          </div>

          <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12 mb-12">
            <form onSubmit={handleCalculate} className="max-w-2xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                <div className="space-y-3">
                  <Label htmlFor="principal" className="text-base font-semibold text-primary">
                    Loan Amount
                  </Label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground text-lg">
                      $
                    </span>
                    <Input
                      id="principal"
                      type="number"
                      step="0.01"
                      placeholder="50000"
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
                      step="0.01"
                      placeholder="5.5"
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

                <div className="space-y-3 md:col-span-2">
                  <Label htmlFor="term" className="text-base font-semibold text-primary">
                    Loan Term (Years)
                  </Label>
                  <Input
                    id="term"
                    type="number"
                    step="0.5"
                    placeholder="15"
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
                Calculate Loan
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
