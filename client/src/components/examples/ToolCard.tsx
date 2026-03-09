import ToolCard from '../ToolCard';
import { Calculator, FileText, Clock } from 'lucide-react';

export default function ToolCardExample() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6">
      <ToolCard
        title="Profit Margin Calculator"
        description="Calculate your profit margin and markup with ease. Perfect for pricing decisions."
        icon={Calculator}
        href="/tools/profit-margin"
        badge="Popular"
      />
      <ToolCard
        title="PDF Merger"
        description="Combine multiple PDF files into one document quickly and easily."
        icon={FileText}
        href="/tools/pdf-merge"
      />
      <ToolCard
        title="Pomodoro Timer"
        description="Stay focused with the Pomodoro technique. Boost your productivity today."
        icon={Clock}
        href="/tools/pomodoro"
        badge="New"
      />
    </div>
  );
}
