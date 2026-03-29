import { Link } from "wouter";
import logoImage from "@assets/Tymflo-horizontal-crlPng_1761361152989.png";

export default function Footer() {
  return (
    <footer className="border-t border-[#F0EDE8] bg-white mt-auto">
      <div className="container mx-auto max-w-6xl px-6 py-10">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
          {/* Brand */}
          <div>
            <img src={logoImage} alt="TymFlo" className="h-8 w-auto mb-2" />
            <p className="text-xs text-[#B0ADA8]">What's done. What's moving. What's next.</p>
          </div>

          {/* Links */}
          <nav className="flex flex-wrap gap-x-8 gap-y-3">
            <Link href="/" className="text-sm text-[#6B6B6B] hover:text-[#F69679] transition-colors" data-testid="footer-link-updates">
              Updates
            </Link>
            <Link href="/resources" className="text-sm text-[#6B6B6B] hover:text-[#F69679] transition-colors" data-testid="footer-link-resources">
              Resource Suite
            </Link>
            <Link href="/privacy" className="text-sm text-[#6B6B6B] hover:text-[#F69679] transition-colors" data-testid="footer-link-privacy">
              Privacy
            </Link>
            <Link href="/terms" className="text-sm text-[#6B6B6B] hover:text-[#F69679] transition-colors" data-testid="footer-link-terms">
              Terms
            </Link>
          </nav>
        </div>

        <div className="mt-8 pt-6 border-t border-[#F0EDE8]">
          <p className="text-xs text-[#B0ADA8]">© {new Date().getFullYear()} TymFlo. All rights reserved. Marketing handled.</p>
        </div>
      </div>
    </footer>
  );
}
