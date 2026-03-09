import { Search, Check } from "lucide-react";

interface HeroProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export default function Hero({ searchQuery, onSearchChange }: HeroProps) {
  return (
    <section className="relative bg-gradient-to-b from-accent/30 to-background py-20 md:py-32">
      <div className="container mx-auto max-w-5xl px-6 text-center">
        <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-primary mb-6">
          Work Smarter. Every Day.
        </h1>
        <p className="text-xl md:text-2xl text-muted-foreground mb-12 max-w-3xl mx-auto leading-relaxed">
          Free tools for business calculations, PDF handling, and productivity.<br />
          Simple, fast, and secure.
        </p>

        <div className="max-w-2xl mx-auto mb-16">
          <div className="relative group">
            <Search className="absolute left-6 top-1/2 transform -translate-y-1/2 text-muted-foreground h-6 w-6" />
            <input
              type="search"
              placeholder="Search for a tool..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-16 pr-6 py-6 rounded-2xl border-2 border-border bg-white text-lg focus:outline-none focus:ring-4 focus:ring-primary/20 focus:border-primary transition-all shadow-lg"
              data-testid="input-search"
            />
          </div>
        </div>

        <div className="flex flex-wrap justify-center items-center gap-8 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Check className="w-5 h-5 text-primary" />
            <span>No registration required</span>
          </div>
          <div className="flex items-center gap-2">
            <Check className="w-5 h-5 text-primary" />
            <span>Files deleted after 1 hour</span>
          </div>
          <div className="flex items-center gap-2">
            <Check className="w-5 h-5 text-primary" />
            <span>Secure encryption</span>
          </div>
        </div>
      </div>
    </section>
  );
}
