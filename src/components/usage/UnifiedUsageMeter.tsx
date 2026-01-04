import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Zap,
  TrendingUp,
  ChevronDown,
  ChevronLeft,
  Sparkles,
  MessageCircle,
  Stethoscope,
  Leaf,
  FileText,
  Mic,
  AlertTriangle,
  Coins,
  Info,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useUsageTracking } from '@/hooks/useUsageTracking';
import { useTier } from '@/hooks/useTier';
import { cn } from '@/lib/utils';

// Constants
const TIER_NAMES: Record<string, string> = {
  trial: 'ניסיון',
  standard: 'סטנדרט',
  premium: 'פרימיום',
};

const TOKENS_PER_QUERY = 500;
const QUERIES_PER_PATIENT = 5;

type UsageVariant = 'badge' | 'card' | 'widget';

interface UnifiedUsageMeterProps {
  variant?: UsageVariant;
  className?: string;
  showDrawer?: boolean;
  backgroundImage?: string;
}

// Shared usage breakdown icons
const BREAKDOWN_CONFIG = [
  { type: 'chat', label: 'צ׳אט AI', icon: MessageCircle, color: 'text-blue-500' },
  { type: 'diagnosis', label: 'אבחון', icon: Stethoscope, color: 'text-jade' },
  { type: 'treatment', label: 'טיפול', icon: Stethoscope, color: 'text-teal-500' },
  { type: 'herbs', label: 'צמחים', icon: Leaf, color: 'text-green-600' },
  { type: 'points', label: 'נקודות', icon: Sparkles, color: 'text-indigo-500' },
  { type: 'summary', label: 'סיכומים', icon: FileText, color: 'text-amber-500' },
  { type: 'transcription', label: 'תמלול', icon: Mic, color: 'text-purple-500' },
];

// Helper functions
const formatNumber = (num: number): string => {
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toLocaleString();
};

const getStatusColor = (percentage: number): string => {
  if (percentage >= 90) return 'text-destructive';
  if (percentage >= 75) return 'text-amber-500';
  return 'text-jade';
};

const getProgressBgColor = (percentage: number): string => {
  if (percentage >= 90) return 'bg-destructive';
  if (percentage >= 75) return 'bg-amber-500';
  return 'bg-jade';
};

export function UnifiedUsageMeter({
  variant = 'card',
  className,
  showDrawer = true,
  backgroundImage,
}: UnifiedUsageMeterProps) {
  const navigate = useNavigate();
  const { usageData, isLoading } = useUsageTracking();
  const { tier } = useTier();
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Calculate usage metrics
  const currentUsed = usageData?.currentUsed || 0;
  const tierLimit = usageData?.tierLimit || 500;
  const percentage = Math.min(Math.round((currentUsed / tierLimit) * 100), 100);
  const remaining = tierLimit - currentUsed;
  const tokensUsed = currentUsed * TOKENS_PER_QUERY;
  const tokensRemaining = remaining * TOKENS_PER_QUERY;
  const patientsRemaining = Math.floor(remaining / QUERIES_PER_PATIENT);
  const isLow = percentage >= 75;
  const isCritical = percentage >= 90;

  const tierName = TIER_NAMES[tier || 'trial'] || tier;
  const statusColor = getStatusColor(percentage);
  const progressColor = getProgressBgColor(percentage);

  // Usage breakdown with proper typing
  const breakdown = usageData?.breakdown || {} as Record<string, number>;
  const totalBreakdown = Object.values(breakdown).reduce((a: number, b: number) => a + b, 0) || 1;
  const usageBreakdown = BREAKDOWN_CONFIG
    .map((item) => ({ ...item, count: (breakdown[item.type] as number) || 0 }))
    .filter((item) => item.count > 0);

  // Shared drawer content
  const DrawerContentInner = () => (
    <div className="px-6 pb-6 space-y-6" dir="rtl">
      {/* Current Tier & Progress */}
      <div className="bg-gradient-to-br from-jade/5 to-gold/5 rounded-xl p-4 border border-jade/20">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Badge className="bg-jade/20 text-jade-dark border-jade/30">{tierName}</Badge>
            <span className="text-sm text-muted-foreground">
              {currentUsed.toLocaleString()} / {tierLimit.toLocaleString()}
            </span>
          </div>
          <span className={cn('text-sm font-bold', statusColor)}>{percentage}%</span>
        </div>
        <Progress
          value={percentage}
          className={cn('h-3', isCritical ? '[&>div]:bg-destructive' : isLow ? '[&>div]:bg-amber-500' : '[&>div]:bg-jade')}
        />
        <p className="text-sm text-muted-foreground mt-2 text-center">
          נותרו {remaining.toLocaleString()} שאילתות החודש
        </p>
      </div>

      {/* Usage Breakdown */}
      <div className="space-y-3">
        <h3 className="font-medium text-sm flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-jade" />
          פירוט שימוש
        </h3>
        <div className="space-y-2">
          {usageBreakdown.length > 0 ? (
            usageBreakdown.map((item) => {
              const IconComponent = item.icon;
              return (
                <div key={item.type} className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-2">
                    <IconComponent className={cn('h-4 w-4', item.color)} />
                    <span className="text-sm">{item.label}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium">{item.count}</span>
                    <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
                      <div
                        className={cn('h-full rounded-full', item.color.replace('text-', 'bg-'))}
                        style={{ width: `${(item.count / totalBreakdown) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <p className="text-sm text-muted-foreground text-center py-2">אין נתוני שימוש עדיין</p>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-muted/50 rounded-lg p-3 text-center">
          <p className="text-2xl font-bold text-jade">{usageData?.uniquePatients || 0}</p>
          <p className="text-xs text-muted-foreground">מטופלים פעילים</p>
        </div>
        <div className="bg-muted/50 rounded-lg p-3 text-center">
          <p className="text-2xl font-bold text-gold-dark">{patientsRemaining}</p>
          <p className="text-xs text-muted-foreground">מטופלים נותרו (ממוצע)</p>
        </div>
      </div>

      {/* Upgrade CTA */}
      {tier !== 'premium' && percentage >= 50 && (
        <Button
          onClick={() => {
            setDrawerOpen(false);
            navigate('/pricing');
          }}
          className="w-full bg-gradient-to-r from-jade to-jade-dark hover:from-jade-dark hover:to-jade text-white"
        >
          <Sparkles className="h-4 w-4 ml-2" />
          {tier === 'trial' ? 'שדרג לסטנדרט' : 'שדרג לפרימיום'}
        </Button>
      )}
    </div>
  );

  // Badge variant (header)
  if (variant === 'badge') {
    if (isLoading || !usageData) {
      return (
        <Badge variant="outline" className={cn('h-7 px-2 gap-1 animate-pulse bg-muted', className)}>
          <Zap className="h-3 w-3" />
          <span className="text-xs">...</span>
        </Badge>
      );
    }

    const trigger = (
      <Button
        variant="ghost"
        size="sm"
        className={cn(
          'h-7 px-2 gap-1.5 text-xs font-medium transition-colors',
          isCritical
            ? 'bg-destructive/10 text-destructive hover:bg-destructive/20'
            : isLow
              ? 'bg-amber-500/10 text-amber-600 hover:bg-amber-500/20'
              : 'bg-jade/10 text-jade-dark hover:bg-jade/20',
          className
        )}
      >
        <Zap className="h-3 w-3" />
        <span>{remaining.toLocaleString()}</span>
        <ChevronDown className="h-3 w-3 opacity-50" />
      </Button>
    );

    if (!showDrawer) return trigger;

    return (
      <Drawer open={drawerOpen} onOpenChange={setDrawerOpen}>
        <DrawerTrigger asChild>{trigger}</DrawerTrigger>
        <DrawerContent className="max-h-[85vh]">
          <DrawerHeader className="text-center pb-2">
            <DrawerTitle className="flex items-center justify-center gap-2 text-lg">
              <Sparkles className="h-5 w-5 text-jade" />
              שימוש חודשי
            </DrawerTitle>
          </DrawerHeader>
          <DrawerContentInner />
        </DrawerContent>
      </Drawer>
    );
  }

  // Widget variant (ROI widget style with background image)
  if (variant === 'widget') {
    const handleNavigate = () => navigate('/roi-simulator');
    const handleUpgrade = (e: React.MouseEvent) => {
      e.stopPropagation();
      navigate('/pricing');
    };

    const getStatusMessage = () => {
      if (isCritical) return 'קרדיטים נמוכים!';
      if (isLow) return 'שימו לב לצריכה';
      return 'מצב תקין';
    };

    const getStatusIcon = () => {
      if (isCritical) return <AlertTriangle className="w-4 h-4 text-destructive" />;
      if (isLow) return <AlertTriangle className="w-4 h-4 text-amber-500" />;
      return <TrendingUp className="w-4 h-4 text-jade" />;
    };

    return (
      <Card
        className={cn(
          'relative overflow-hidden border-jade/20 hover:shadow-lg hover:shadow-jade/10 transition-all duration-300 cursor-pointer group',
          className
        )}
        onClick={handleNavigate}
        style={
          backgroundImage
            ? {
                backgroundImage: `linear-gradient(to bottom, rgba(0,0,0,0.55), rgba(0,0,0,0.75)), url(${backgroundImage})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }
            : undefined
        }
      >
        <CardContent className="p-4 space-y-3">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {getStatusIcon()}
              <span className="text-sm font-medium text-white/90">{getStatusMessage()}</span>
            </div>
            <ChevronLeft className="w-4 h-4 text-white/60 group-hover:text-white transition-colors" />
          </div>

          {/* Usage Stats */}
          <div className="space-y-2">
            <div className="flex justify-between items-end">
              <div>
                <div className="text-2xl font-bold text-white">
                  {isLoading ? '...' : currentUsed.toLocaleString()}
                </div>
                <div className="text-xs text-white/60">מתוך {tierLimit.toLocaleString()} שאילתות</div>
              </div>
              <div className="text-left">
                <div className="text-lg font-semibold text-jade-light">~{patientsRemaining}</div>
                <div className="text-xs text-white/60">מטופלים נותרו</div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="relative h-2 rounded-full bg-white/20 overflow-hidden">
              <div
                className={cn('absolute inset-y-0 right-0 rounded-full transition-all duration-500', progressColor)}
                style={{ width: `${Math.min(percentage, 100)}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-white/50">
              <span>{percentage}% בשימוש</span>
              <span>{100 - percentage}% פנוי</span>
            </div>
          </div>

          {/* Action Button for Low Balance */}
          {isLow && (
            <Button
              size="sm"
              className="w-full gap-2 bg-gradient-to-l from-purple-600 to-jade hover:from-purple-700 hover:to-jade-dark text-white"
              onClick={handleUpgrade}
            >
              <Zap className="w-4 h-4" />
              שדרג עכשיו
            </Button>
          )}
        </CardContent>
      </Card>
    );
  }

  // Card variant (full card - default)
  return (
    <Card className={cn('overflow-hidden', className)}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-medium flex items-center gap-2">
            <Coins className="h-5 w-5 text-gold" />
            שימוש בטוקנים
          </CardTitle>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button className="text-muted-foreground hover:text-foreground transition-colors">
                  <Info className="h-4 w-4" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="top" className="max-w-xs text-right">
                <p>טוקנים הם יחידות עיבוד AI. כל שאילתה ל-TCM Brain צורכת טוקנים. המכסה מתחדשת ב-1 לכל חודש.</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading ? (
          <div className="h-20 flex items-center justify-center">
            <div className="animate-pulse text-muted-foreground text-sm">טוען נתונים...</div>
          </div>
        ) : (
          <>
            {/* Progress bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">תוכנית {tierName}</span>
                <span className={cn('font-medium', statusColor)}>{percentage}%</span>
              </div>
              <div className="relative h-3 bg-muted rounded-full overflow-hidden">
                <div
                  className={cn('absolute top-0 left-0 h-full rounded-full transition-all', progressColor)}
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-muted/50 rounded-lg p-3 text-center">
                <div className="text-2xl font-bold text-foreground">{formatNumber(tokensUsed)}</div>
                <div className="text-xs text-muted-foreground">נוצלו החודש</div>
              </div>
              <div className="bg-muted/50 rounded-lg p-3 text-center">
                <div className={cn('text-2xl font-bold', statusColor)}>{formatNumber(tokensRemaining)}</div>
                <div className="text-xs text-muted-foreground">נותרו</div>
              </div>
            </div>

            {/* Warning if near limit */}
            {isLow && (
              <div
                className={cn(
                  'flex items-center gap-2 text-sm p-2 rounded-lg',
                  isCritical ? 'bg-destructive/10 text-destructive' : 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                )}
              >
                {isCritical ? (
                  <AlertTriangle className="h-4 w-4 shrink-0" />
                ) : (
                  <TrendingUp className="h-4 w-4 shrink-0" />
                )}
                <span>
                  {isCritical
                    ? 'מומלץ לשדרג תוכנית או לחכות לחידוש החודשי'
                    : 'אתם מתקרבים למגבלת הטוקנים החודשית'}
                </span>
              </div>
            )}

            {/* Queries estimate */}
            <div className="text-xs text-muted-foreground text-center pt-2 border-t">
              ≈ {Math.floor(tokensRemaining / TOKENS_PER_QUERY)} שאילתות AI נותרו (בממוצע)
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

// Named exports for convenience
export const UsageBadge = (props: Omit<UnifiedUsageMeterProps, 'variant'>) => (
  <UnifiedUsageMeter variant="badge" {...props} />
);

export const UsageCard = (props: Omit<UnifiedUsageMeterProps, 'variant'>) => (
  <UnifiedUsageMeter variant="card" {...props} />
);

export const UsageWidget = (props: Omit<UnifiedUsageMeterProps, 'variant'>) => (
  <UnifiedUsageMeter variant="widget" {...props} />
);
