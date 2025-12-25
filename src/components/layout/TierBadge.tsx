import { useTier } from '@/hooks/useTier';
import { Badge } from '@/components/ui/badge';
import { Crown, Star, Clock } from 'lucide-react';

export function TierBadge() {
  const { tier, daysRemaining } = useTier();

  if (!tier) return null;

  const tierConfig = {
    trial: {
      label: `ניסיון (${daysRemaining} ימים)`,
      icon: Clock,
      className: 'bg-muted text-muted-foreground',
    },
    standard: {
      label: 'סטנדרט',
      icon: Star,
      className: 'bg-jade text-primary-foreground',
    },
    premium: {
      label: 'פרימיום',
      icon: Crown,
      className: 'bg-gold text-primary-foreground',
    },
  };

  const config = tierConfig[tier];
  const Icon = config.icon;

  return (
    <Badge className={`${config.className} gap-1.5 px-3 py-1`}>
      <Icon className="h-3.5 w-3.5" />
      <span>{config.label}</span>
    </Badge>
  );
}
