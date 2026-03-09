import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check } from "lucide-react";

interface PricingTier {
  name: string;
  price: string;
  period: string;
  features: string[];
  popular?: boolean;
  cta: string;
}

const tiers: PricingTier[] = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    features: [
      "5 operations per day",
      "All calculator tools",
      "PDF tools (up to 10MB)",
      "Image conversion",
      "Community support",
    ],
    cta: "Get Started",
  },
  {
    name: "Pro",
    price: "$9",
    period: "per month",
    popular: true,
    features: [
      "Unlimited operations",
      "No ads",
      "Up to 100MB files",
      "Batch processing",
      "Priority support",
      "Advanced analytics",
    ],
    cta: "Upgrade to Pro",
  },
  {
    name: "Team",
    price: "$29",
    period: "per month",
    features: [
      "Everything in Pro",
      "Team workspace",
      "Up to 10 members",
      "Shared tool history",
      "Admin dashboard",
      "Dedicated support",
    ],
    cta: "Upgrade to Team",
  },
];

export default function PricingTable() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {tiers.map((tier) => (
        <Card
          key={tier.name}
          className={`p-8 relative ${tier.popular ? "border-primary shadow-lg" : ""}`}
          data-testid={`card-pricing-${tier.name.toLowerCase()}`}
        >
          {tier.popular && (
            <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2" data-testid="badge-popular">
              Most Popular
            </Badge>
          )}

          <div className="text-center mb-6">
            <h3 className="text-2xl font-bold mb-2">{tier.name}</h3>
            <div className="mb-2">
              <span className="text-5xl font-bold">{tier.price}</span>
              <span className="text-muted-foreground ml-2">/ {tier.period}</span>
            </div>
          </div>

          <ul className="space-y-3 mb-8">
            {tier.features.map((feature, index) => (
              <li key={index} className="flex items-start gap-2">
                <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <span className="text-sm">{feature}</span>
              </li>
            ))}
          </ul>

          <Button
            className="w-full"
            variant={tier.popular ? "default" : "outline"}
            size="lg"
            data-testid={`button-cta-${tier.name.toLowerCase()}`}
            onClick={() => console.log(`Selected ${tier.name} plan`)}
          >
            {tier.cta}
          </Button>
        </Card>
      ))}
    </div>
  );
}
