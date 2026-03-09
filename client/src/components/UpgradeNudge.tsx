import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Zap } from "lucide-react";
import { Link } from "wouter";

interface UpgradeNudgeProps {
  open: boolean;
  onClose: () => void;
}

export default function UpgradeNudge({ open, onClose }: UpgradeNudgeProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md" data-testid="dialog-upgrade">
        <DialogHeader>
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              <Zap className="w-8 h-8 text-primary" />
            </div>
          </div>
          <DialogTitle className="text-center text-2xl">You've reached today's limit</DialogTitle>
          <DialogDescription className="text-center text-base mt-2">
            You've hit today's free limit. Go Pro for unlimited tools and no ads.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-6">
          <Link href="/pricing">
            <Button className="w-full" size="lg" data-testid="button-upgrade-pro">
              Upgrade to Pro
            </Button>
          </Link>
          <Link href="/pricing">
            <Button variant="ghost" className="w-full" onClick={onClose} data-testid="button-view-pricing">
              View Pricing
            </Button>
          </Link>
        </div>
      </DialogContent>
    </Dialog>
  );
}
