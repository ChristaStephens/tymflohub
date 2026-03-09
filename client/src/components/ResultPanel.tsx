import { Card } from "@/components/ui/card";
import { Lightbulb } from "lucide-react";

interface ResultMetric {
  label: string;
  value: string;
  unit?: string;
  primary?: boolean;
}

interface ResultPanelProps {
  results: ResultMetric[] | null;
  emptyMessage?: string;
}

export default function ResultPanel({ results, emptyMessage = "Enter values to calculate" }: ResultPanelProps) {
  if (!results) {
    return (
      <Card className="p-8 sticky top-20" data-testid="panel-result-empty">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
            <Lightbulb className="w-8 h-8 text-muted-foreground" />
          </div>
          <p className="text-muted-foreground">{emptyMessage}</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-8 sticky top-20" data-testid="panel-result">
      <h3 className="text-lg font-semibold mb-6">Results</h3>

      <div className="space-y-4">
        {results.map((metric, index) => (
          <div
            key={index}
            className={`p-4 rounded-lg ${metric.primary ? "bg-primary/10 border border-primary/20" : "bg-muted"}`}
            data-testid={`result-${metric.label.toLowerCase().replace(/\s+/g, '-')}`}
          >
            <div className="text-sm text-muted-foreground mb-1">{metric.label}</div>
            <div className="flex items-baseline gap-2">
              <span className={`font-mono font-bold ${metric.primary ? "text-4xl" : "text-2xl"}`}>
                {metric.value}
              </span>
              {metric.unit && <span className="text-lg text-muted-foreground">{metric.unit}</span>}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
