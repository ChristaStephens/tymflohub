import { useState, useRef, useEffect } from "react";
import { Search } from "lucide-react";
import { Link } from "wouter";

interface Tool {
  title: string;
  description: string;
  href: string;
  icon: any;
  category: string;
}

interface SearchWithDropdownProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  allTools: Tool[];
}

export default function SearchWithDropdown({
  searchQuery,
  onSearchChange,
  allTools,
}: SearchWithDropdownProps) {
  const [showDropdown, setShowDropdown] = useState(false);
  const [filteredTools, setFilteredTools] = useState<Tool[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      const results = allTools.filter(
        (tool) =>
          tool.title.toLowerCase().includes(query) ||
          tool.description.toLowerCase().includes(query) ||
          tool.category.toLowerCase().includes(query)
      ).slice(0, 6); // Show max 6 suggestions
      setFilteredTools(results);
      setShowDropdown(results.length > 0);
    } else {
      setShowDropdown(false);
      setFilteredTools([]);
    }
  }, [searchQuery, allTools]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="max-w-2xl mx-auto mb-16 relative" ref={dropdownRef}>
      <div className="relative group">
        <Search className="absolute left-6 top-1/2 transform -translate-y-1/2 text-muted-foreground h-6 w-6 z-10" />
        <input
          type="search"
          placeholder="Search for a tool..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          onFocus={() => {
            if (filteredTools.length > 0) {
              setShowDropdown(true);
            }
          }}
          className="w-full pl-16 pr-6 py-6 rounded-2xl border-2 border-border bg-white text-lg focus:outline-none focus:ring-4 focus:ring-primary/20 focus:border-primary transition-all shadow-lg"
          data-testid="input-search"
        />
      </div>

      {showDropdown && filteredTools.length > 0 && (
        <div className="absolute top-full mt-2 w-full bg-white rounded-2xl border-2 border-border shadow-2xl z-50 overflow-hidden">
          {filteredTools.map((tool, index) => (
            <Link
              key={tool.href}
              href={tool.href}
              onClick={() => {
                setShowDropdown(false);
                onSearchChange("");
              }}
            >
              <div
                className={`flex items-center gap-4 px-6 py-4 hover-elevate cursor-pointer ${
                  index !== filteredTools.length - 1 ? "border-b border-border" : ""
                }`}
                data-testid={`search-result-${index}`}
              >
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <tool.icon className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-foreground truncate">{tool.title}</p>
                  <p className="text-sm text-muted-foreground truncate">{tool.category}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
