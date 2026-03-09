import { Link } from "wouter";

export default function Footer() {
  return (
    <footer className="border-t bg-background mt-auto">
      <div className="container mx-auto max-w-7xl px-6 py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-12 mb-12">
          <div>
            <h3 className="font-bold text-sm uppercase text-primary mb-4 tracking-wide">Calculators</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/tools/profit-margin" className="text-muted-foreground hover:text-primary transition-colors" data-testid="link-footer-profit-margin">
                  Profit Margin
                </Link>
              </li>
              <li>
                <Link href="/tools/markup" className="text-muted-foreground hover:text-primary transition-colors" data-testid="link-footer-markup">
                  Markup
                </Link>
              </li>
              <li>
                <Link href="/tools/breakeven" className="text-muted-foreground hover:text-primary transition-colors" data-testid="link-footer-breakeven">
                  Break-Even
                </Link>
              </li>
              <li>
                <Link href="/tools/roi" className="text-muted-foreground hover:text-primary transition-colors" data-testid="link-footer-roi">
                  ROI
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-sm uppercase text-primary mb-4 tracking-wide">PDF Tools</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/tools/pdf-merge" className="text-muted-foreground hover:text-primary transition-colors" data-testid="link-footer-pdf-merge">
                  Merge PDF
                </Link>
              </li>
              <li>
                <Link href="/tools/pdf-split" className="text-muted-foreground hover:text-primary transition-colors" data-testid="link-footer-pdf-split">
                  Split PDF
                </Link>
              </li>
              <li>
                <Link href="/tools/pdf-compress" className="text-muted-foreground hover:text-primary transition-colors" data-testid="link-footer-pdf-compress">
                  Compress PDF
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-sm uppercase text-primary mb-4 tracking-wide">Company</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/pricing" className="text-muted-foreground hover:text-primary transition-colors" data-testid="link-footer-support">
                  Support Us
                </Link>
              </li>
              <li>
                <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                  About Us
                </a>
              </li>
              <li>
                <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                  Blog
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-sm uppercase text-primary mb-4 tracking-wide">Legal</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/privacy" className="text-muted-foreground hover:text-primary transition-colors" data-testid="link-footer-privacy">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-muted-foreground hover:text-primary transition-colors" data-testid="link-footer-terms">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-muted-foreground">
              © 2025 TymFlo Hub. All rights reserved.
            </p>
            <p className="text-sm text-muted-foreground">
              Contact: <a href="mailto:hello@tymflo.com" className="text-primary hover:underline" data-testid="link-contact-email">hello@tymflo.com</a>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
