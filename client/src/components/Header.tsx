import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import logoImage from "@assets/Tymflo-horizontal-crlPng_1761361152989.png";

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur-lg">
      <div className="container flex h-16 items-center justify-between px-6 mx-auto max-w-7xl">
        <Link href="/" className="flex items-center" data-testid="link-home">
          <img src={logoImage} alt="TymFlo Hub" className="h-9 md:h-10" />
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          <Link href="/" className="text-base font-medium text-foreground hover:text-primary transition-colors" data-testid="link-tools">
            All Tools
          </Link>
          <Link href="/pricing" className="text-base font-medium text-foreground hover:text-primary transition-colors" data-testid="link-support">
            Support Us
          </Link>
        </nav>

        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          data-testid="button-menu-toggle"
        >
          {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </Button>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden border-t bg-white">
          <nav className="container px-6 py-4 flex flex-col gap-2 max-w-7xl mx-auto">
            <Link 
              href="/" 
              className="text-base font-medium hover:text-primary py-2" 
              data-testid="link-tools-mobile"
              onClick={() => setMobileMenuOpen(false)}
            >
              All Tools
            </Link>
            <Link 
              href="/pricing" 
              className="text-base font-medium hover:text-primary py-2" 
              data-testid="link-support-mobile"
              onClick={() => setMobileMenuOpen(false)}
            >
              Support Us
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
