import { useState } from "react";
import { BarChart2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import FAQ from "@/components/FAQ";
import SEO from "@/components/SEO";

interface ResultMetric {
  label: string;
  value: string;
  unit?: string;
  primary?: boolean;
}

export default function MeanMedianMode() {
  const [numbers, setNumbers] = useState("");
  const [results, setResults] = useState<ResultMetric[] | null>(null);

  const handleCalculate = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Parse numbers from input (comma, space, or newline separated)
    const nums = numbers
      .split(/[,\s\n]+/)
      .map(n => parseFloat(n.trim()))
      .filter(n => !isNaN(n));
    
    if (nums.length > 0) {
      // Calculate Mean
      const mean = nums.reduce((sum, num) => sum + num, 0) / nums.length;
      
      // Calculate Median
      const sorted = [...nums].sort((a, b) => a - b);
      const median = sorted.length % 2 === 0
        ? (sorted[sorted.length / 2 - 1] + sorted[sorted.length / 2]) / 2
        : sorted[Math.floor(sorted.length / 2)];
      
      // Calculate Mode
      const frequency: { [key: number]: number } = {};
      nums.forEach(num => {
        frequency[num] = (frequency[num] || 0) + 1;
      });
      const maxFreq = Math.max(...Object.values(frequency));
      const modes = Object.keys(frequency)
        .filter(num => frequency[Number(num)] === maxFreq)
        .map(Number);
      const modeStr = maxFreq > 1 ? modes.join(", ") : "No mode";
      
      // Calculate Range
      const range = Math.max(...nums) - Math.min(...nums);

      setResults([
        { label: "Mean (Average)", value: mean.toFixed(2), primary: true },
        { label: "Median", value: median.toFixed(2) },
        { label: "Mode", value: modeStr },
        { label: "Range", value: range.toFixed(2) },
        { label: "Count", value: nums.length.toString() },
        { label: "Sum", value: nums.reduce((sum, n) => sum + n, 0).toFixed(2) },
      ]);
    }
  };

  const faqItems = [
    {
      question: "What is the difference between mean, median, and mode?",
      answer: "Mean is the average of all numbers. Median is the middle value when numbers are sorted. Mode is the most frequently occurring number. Each measure provides different insights about your data.",
    },
    {
      question: "When should I use median instead of mean?",
      answer: "Use median when your data has outliers or is skewed. Median is less affected by extreme values and better represents the 'typical' value in such cases.",
    },
    {
      question: "What if my data has no mode?",
      answer: "If all values appear the same number of times (frequency of 1), there is no mode. This calculator will display 'No mode' in such cases.",
    },
    {
      question: "How do I enter my numbers?",
      answer: "You can enter numbers separated by commas, spaces, or on separate lines. For example: '1, 2, 3, 4, 5' or '1 2 3 4 5' or one number per line.",
    },
  ];

  return (
    <>
      <SEO
        title="Mean, Median, Mode Calculator - Statistics Tool | TymFlo Hub"
        description="Calculate mean, median, mode, and other statistics for your data set. Free online central tendency calculator with instant results."
        canonical="https://tymflohub.com/tools/mean-median-mode"
      />

      <div className="min-h-screen bg-gradient-to-b from-accent/20 to-background py-12">
        <div className="container mx-auto max-w-5xl px-6">
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-primary/70 mb-6">
              <BarChart2 className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-primary mb-4">
              Mean, Median, Mode Calculator
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Calculate central tendency measures and basic statistics for your data set
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
                    placeholder="1, 2, 3, 4, 5, 5, 6, 7, 8, 9"
                    value={numbers}
                    onChange={(e) => setNumbers(e.target.value)}
                    className="min-h-32 text-lg rounded-xl border-2 resize-none"
                    data-testid="input-numbers"
                  />
                  <p className="text-sm text-muted-foreground">
                    Example: 10, 20, 30, 40 or 10 20 30 40 or one number per line
                  </p>
                </div>
              </div>

              <Button
                type="submit"
                size="lg"
                className="w-full h-14 text-lg rounded-xl"
                data-testid="button-calculate"
              >
                Calculate Statistics
              </Button>
            </form>

            {results && (
              <div className="mt-12 pt-12 border-t">
                <h3 className="text-2xl font-bold text-center text-primary mb-8">Results</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {results.map((metric, index) => (
                    <div
                      key={index}
                      className={`text-center p-6 rounded-2xl ${
                        metric.primary
                          ? "bg-gradient-to-br from-primary/10 to-accent/10 border-2 border-primary/20"
                          : "bg-muted/50"
                      }`}
                      data-testid={`result-${metric.label.toLowerCase().replace(/[\s()]/g, '-')}`}
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
