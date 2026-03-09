import { Construction } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import SEO from "@/components/SEO";

interface ToolPlaceholderProps {
  title: string;
  description: string;
  icon: React.ComponentType<any>;
}

export default function ToolPlaceholder({ title, description, icon: Icon }: ToolPlaceholderProps) {
  return (
    <>
      <SEO
        title={`${title} - Coming Soon | TymFlo Hub`}
        description={description}
      />

      <div className="min-h-screen bg-gradient-to-b from-accent/30 to-background py-12">
        <div className="container mx-auto max-w-4xl px-6">
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-primary/80 mb-6">
              <Icon className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-primary mb-4">
              {title}
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              {description}
            </p>
          </div>

          <Card className="text-center p-12">
            <CardContent className="space-y-6">
              <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                <Construction className="w-12 h-12 text-primary" />
              </div>
              <h2 className="text-2xl font-bold text-primary">Coming Soon!</h2>
              <p className="text-muted-foreground max-w-md mx-auto">
                We're working hard to bring you this tool. Check back soon or try our other available tools.
              </p>
              <Link href="/">
                <Button size="lg" className="mt-4" data-testid="button-back-home">
                  Browse All Tools
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
