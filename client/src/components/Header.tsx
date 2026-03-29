import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Menu, X, Briefcase } from "lucide-react";
import logoImage from "@assets/Tymflo-horizontal-crlPng_1761361152989.png";

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [location] = useLocation();

  const navLink = (href: string, label: string, testId: string, icon?: React.ReactNode) => {
    const isActive = location === href || (href !== "/" && location.startsWith(href));
    return (
      <Link
        href={href}
        className={`text-sm font-medium transition-colors flex items-center gap-1.5 ${
          isActive ? "text-[#F69679]" : "text-[#5A5A5A] hover:text-[#1A1A1A]"
        }`}
        data-testid={testId}
        onClick={() => setMobileMenuOpen(false)}
      >
        {icon}
        {label}
      </Link>
    );
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[#F0EDE8] bg-white/90 backdrop-blur-lg">
      <div className="container flex h-16 items-center justify-between px-6 mx-auto max-w-6xl">
        <Link href="/" className="flex items-center" data-testid="link-home">
          <img src={logoImage} alt="TymFlo" className="h-8 md:h-9 w-auto" />
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          {navLink("/", "Updates", "link-updates")}
          {navLink("/resources", "Resource Suite", "link-resources", <Briefcase className="w-3.5 h-3.5" />)}
        </nav>

        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          data-testid="button-menu-toggle"
        >
          {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden border-t border-[#F0EDE8] bg-white">
          <nav className="container px-6 py-4 flex flex-col gap-1 max-w-6xl mx-auto">
            <Link href="/" className="text-sm font-medium py-2.5 text-[#3A3A3A] hover:text-[#F69679]" onClick={() => setMobileMenuOpen(false)} data-testid="link-updates-mobile">Updates</Link>
            <Link href="/resources" className="text-sm font-medium py-2.5 text-[#3A3A3A] hover:text-[#F69679] flex items-center gap-2" onClick={() => setMobileMenuOpen(false)} data-testid="link-resources-mobile">
              <Briefcase className="w-3.5 h-3.5" /> Resource Suite
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
