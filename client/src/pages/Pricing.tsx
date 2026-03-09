import { Heart, Coffee, Sparkles, Check, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import SEO from "@/components/SEO";

const BUYMEACOFFEE_URL = "https://buymeacoffee.com/tymflo";

export default function Pricing() {
  return (
    <>
      <SEO
        title="Support TymFlo Hub - Buy Me a Coffee | TymFlo Hub"
        description="TymFlo Hub is free forever. If our tools make your work easier, consider buying us a coffee to help keep the lights on."
        canonical="https://tymflohub.com/pricing"
        keywords="support, donate, buy me a coffee, free tools"
      />

      <div className="min-h-screen bg-gradient-to-b from-accent/20 to-background py-16">
        <div className="container mx-auto max-w-4xl px-6">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-6">
              <Heart className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-primary mb-4">
              Free Forever
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-2">
              TymFlo Hub's purpose is simple: <strong>make work easier</strong>.
            </p>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              All 41 tools are completely free to use, with no limits, no ads, and no subscriptions.
            </p>
          </div>

          {/* Main Card */}
          <Card className="mb-12 overflow-hidden">
            <CardContent className="p-0">
              <div className="grid md:grid-cols-2">
                {/* Left: What you get */}
                <div className="p-8 bg-muted/30">
                  <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                    <Sparkles className="w-6 h-6 text-primary" />
                    What You Get (Free!)
                  </h2>
                  <ul className="space-y-4">
                    {[
                      "Unlimited PDF operations (merge, split, compress, convert)",
                      "E-Sign documents with verified timestamps",
                      "All financial calculators (margin, markup, ROI, loans)",
                      "Image conversion and compression",
                      "World time converter for global teams",
                      "Unit and currency converters",
                      "Pomodoro timer and productivity tools",
                      "No account required for most tools",
                      "No watermarks or branding on outputs",
                      "Your files are never stored - privacy first",
                    ].map((feature, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Right: Buy Me a Coffee */}
                <div className="p-8 flex flex-col items-center justify-center text-center bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20">
                  <Coffee className="w-16 h-16 text-amber-600 mb-4" />
                  <h2 className="text-2xl font-bold mb-3">Like What We Do?</h2>
                  <p className="text-muted-foreground mb-6 max-w-xs">
                    If TymFlo Hub makes your work easier, consider buying us a coffee to help keep the servers running.
                  </p>
                  <Button
                    size="lg"
                    className="bg-amber-500 hover:bg-amber-600 text-white rounded-full px-8 py-6 text-lg font-semibold"
                    onClick={() => window.open(BUYMEACOFFEE_URL, "_blank")}
                    data-testid="button-buy-coffee"
                  >
                    <Coffee className="w-5 h-5 mr-2" />
                    Buy Me a Coffee
                  </Button>
                  <p className="text-sm text-muted-foreground mt-4">
                    100% optional - all tools remain free regardless
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Our Philosophy */}
          <div className="text-center mb-12">
            <h2 className="text-2xl font-bold mb-4 flex items-center justify-center gap-2">
              <Globe className="w-6 h-6 text-primary" />
              Our Philosophy
            </h2>
            <div className="max-w-2xl mx-auto space-y-4 text-muted-foreground">
              <p>
                We believe productivity tools should be accessible to everyone, not just those who can afford monthly subscriptions. 
              </p>
              <p>
                TymFlo Hub was built to help freelancers, small business owners, students, and anyone who needs to get work done without friction.
              </p>
              <p className="font-medium text-foreground">
                Your support through Buy Me a Coffee helps us keep this vision alive.
              </p>
            </div>
          </div>

          {/* FAQ */}
          <Card>
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold text-center mb-8">
                Frequently Asked Questions
              </h2>
              <div className="space-y-6 max-w-2xl mx-auto">
                <div>
                  <h3 className="font-bold text-lg mb-2">Is TymFlo Hub really free?</h3>
                  <p className="text-muted-foreground">
                    Yes! All 41 tools are completely free to use with no limits. We don't have paid tiers or subscriptions.
                  </p>
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-2">Why don't you charge for premium features?</h3>
                  <p className="text-muted-foreground">
                    Our mission is to make work easier for everyone. We'd rather have the support of our community through optional donations than lock features behind paywalls.
                  </p>
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-2">What does my coffee purchase support?</h3>
                  <p className="text-muted-foreground">
                    Your support helps pay for server costs, development time, and keeps TymFlo Hub running ad-free.
                  </p>
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-2">Is my data safe?</h3>
                  <p className="text-muted-foreground">
                    Absolutely. All file processing happens in your browser or is immediately deleted from our servers. We don't store your documents or personal information.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
