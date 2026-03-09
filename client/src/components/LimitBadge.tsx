import { Badge } from "@/components/ui/badge";

interface LimitBadgeProps {
  current: number;
  limit: number;
}

export default function LimitBadge({ current, limit }: LimitBadgeProps) {
  const percentage = (current / limit) * 100;
  const variant = percentage >= 80 ? "destructive" : "secondary";

  return (
    <Badge variant={variant} className="text-xs font-medium" data-testid="badge-usage-limit">
      {current}/{limit} tools today
    </Badge>
  );
}
