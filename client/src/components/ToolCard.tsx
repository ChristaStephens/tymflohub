import { Link } from "wouter";
import { type LucideIcon, ArrowRight } from "lucide-react";

interface ToolCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  href: string;
  badge?: "Popular" | "New";
  categoryColor?: string;
  section?: string;
}

export default function ToolCard({ title, description, icon: Icon, href, badge, categoryColor, section = "all" }: ToolCardProps) {
  const gradientClass = categoryColor || "from-primary to-primary/70";
  const toolId = href.split('/').pop();
  
  return (
    <Link href={href}>
      <div 
        className="group relative bg-white rounded-2xl border-2 border-border p-8 hover:border-primary hover:shadow-2xl transition-all duration-300 cursor-pointer h-full"
        data-testid={`card-tool-${section}-${toolId}`}
      >
        {badge && (
          <div className="absolute -top-3 right-6">
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
              badge === "Popular" 
                ? "bg-gradient-to-r from-purple-500 to-purple-600 text-white" 
                : "bg-gradient-to-r from-orange-500 to-pink-500 text-white"
            }`} data-testid={`badge-${badge.toLowerCase()}`}>
              {badge}
            </span>
          </div>
        )}

        <div className="flex flex-col items-center text-center h-full">
          <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${gradientClass} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
            <Icon className="w-10 h-10 text-white" />
          </div>

          <h3 className="text-xl font-bold text-primary mb-3 group-hover:text-primary/80 transition-colors">
            {title}
          </h3>
          
          <p className="text-muted-foreground mb-6 flex-1 leading-relaxed">
            {description}
          </p>

          <div className="flex items-center text-primary font-semibold group-hover:gap-3 gap-2 transition-all">
            <span>Choose File</span>
            <ArrowRight className="h-5 w-5" />
          </div>
        </div>
      </div>
    </Link>
  );
}
