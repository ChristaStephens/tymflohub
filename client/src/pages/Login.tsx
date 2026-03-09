import { useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Mail, Loader2 } from "lucide-react";
import SEO from "@/components/SEO";
import { useAuth } from "@/hooks/useAuth";
import { useLocation } from "wouter";

export default function Login() {
  const { isAuthenticated, isLoading } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (isAuthenticated) {
      setLocation("/dashboard");
    } else if (!isLoading) {
      // Redirect to Replit Auth login endpoint
      window.location.href = "/api/login";
    }
  }, [isAuthenticated, isLoading, setLocation]);

  return (
    <>
      <SEO
        title="Login - TymFlo Hub"
        description="Sign in to access your TymFlo Hub dashboard and unlock unlimited tools."
        canonical="https://tymflohub.com/login"
      />

      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-16 px-4">
        <Card className="w-full max-w-md p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
              {isLoading ? (
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
              ) : (
                <Mail className="w-8 h-8 text-primary" />
              )}
            </div>
            <h1 className="text-2xl font-bold mb-2">Welcome Back</h1>
            <p className="text-muted-foreground">
              {isLoading ? "Checking authentication..." : "Redirecting to login..."}
            </p>
          </div>
        </Card>
      </div>
    </>
  );
}
