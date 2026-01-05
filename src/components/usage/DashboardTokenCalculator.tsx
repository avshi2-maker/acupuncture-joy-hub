import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Calculator, Users, Zap, TrendingUp, Info, ChevronLeft, Sparkles } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useUsageTracking } from '@/hooks/useUsageTracking';
import { useTier } from '@/hooks/useTier';
import { cn } from '@/lib/utils';

const TOKENS_PER_PATIENT = 1250;
const TOKENS_PER_QUERY = 500;

const TIER_LIMITS = {
  trial: { tokens: 50000, queries: 100 },
  standard: { tokens: 150000, queries: 300 },
  premium: { tokens: 600000, queries: 1200 },
};

const TIER_NAMES: Record<string, string> = {
  trial: 'ניסיון',
  standard: 'סטנדרט',
  premium: 'פרימיום',
};

interface DashboardTokenCalculatorProps {
  className?: string;
  backgroundImage?: string;
}

export function DashboardTokenCalculator({ className, backgroundImage }: DashboardTokenCalculatorProps) {
  const { usageData, isLoading } = useUsageTracking();
  const { tier } = useTier();
  const [patientsPerWeek, setPatientsPerWeek] = useState(10);
  const [sessionsPerPatient, setSessionsPerPatient] = useState(3);

  // Current usage
  const currentUsed = usageData?.currentUsed || 0;
  const tierLimit = usageData?.tierLimit || 100;
  const percentage = Math.min(Math.round((currentUsed / tierLimit) * 100), 100);
  const remaining = tierLimit - currentUsed;
  const tierName = TIER_NAMES[tier || 'trial'] || tier;

  // Calculator estimates
  const monthlyPatients = patientsPerWeek * 4;
  const totalSessions = monthlyPatients * sessionsPerPatient;
  const estimatedTokens = totalSessions * TOKENS_PER_PATIENT;
  const estimatedQueries = Math.ceil(estimatedTokens / TOKENS_PER_QUERY);

  // Will they exceed their limit?
  const willExceed = estimatedQueries > tierLimit;
  const usageProjection = Math.min((estimatedQueries / tierLimit) * 100, 150);

  const getStatusColor = (pct: number): string => {
    if (pct >= 90) return 'text-destructive';
    if (pct >= 75) return 'text-amber-500';
    return 'text-jade';
  };

  const getProgressBg = (pct: number): string => {
    if (pct >= 90) return 'bg-destructive';
    if (pct >= 75) return 'bg-amber-500';
    return 'bg-jade';
  };

  return (
    <Card
      className={cn(
        'relative overflow-hidden border-jade/20 hover:shadow-lg hover:shadow-jade/10 transition-all duration-300',
        className
      )}
      style={
        backgroundImage
          ? {
              backgroundImage: `linear-gradient(to bottom, rgba(0,0,0,0.6), rgba(0,0,0,0.8)), url(${backgroundImage})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }
          : undefined
      }
    >
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className={cn("text-base font-medium flex items-center gap-2", backgroundImage && "text-white")}>
            <Calculator className="h-5 w-5 text-gold" />
            מחשבון שימוש TOKEN
          </CardTitle>
          <Link to="/pricing">
            <Badge variant="outline" className={cn("text-xs gap-1 hover:bg-jade/10", backgroundImage && "border-white/30 text-white/80 hover:text-white")}>
              {tierName}
              <ChevronLeft className="h-3 w-3" />
            </Badge>
          </Link>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Current Usage */}
        <div className={cn("rounded-lg p-3", backgroundImage ? "bg-white/10 backdrop-blur-sm" : "bg-muted/50")}>
          <div className="flex justify-between items-center mb-2">
            <span className={cn("text-sm", backgroundImage ? "text-white/80" : "text-muted-foreground")}>שימוש נוכחי</span>
            <span className={cn("text-sm font-bold", getStatusColor(percentage))}>
              {isLoading ? '...' : `${currentUsed}/${tierLimit}`}
            </span>
          </div>
          <Progress
            value={percentage}
            className={cn('h-2', percentage >= 90 ? '[&>div]:bg-destructive' : percentage >= 75 ? '[&>div]:bg-amber-500' : '[&>div]:bg-jade')}
          />
          <p className={cn("text-xs mt-1", backgroundImage ? "text-white/60" : "text-muted-foreground")}>
            נותרו {remaining} שאילתות החודש
          </p>
        </div>

        {/* Mini Calculator */}
        <div className="space-y-3">
          {/* Patients per week */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className={cn("flex items-center gap-1 text-xs font-medium", backgroundImage && "text-white/90")}>
                <Users className="h-3 w-3 text-jade" />
                לקוחות בשבוע
              </label>
              <span className={cn("text-sm font-bold", backgroundImage ? "text-jade-light" : "text-jade")}>{patientsPerWeek}</span>
            </div>
            <Slider
              value={[patientsPerWeek]}
              onValueChange={(value) => setPatientsPerWeek(value[0])}
              min={1}
              max={50}
              step={1}
              className="w-full"
            />
          </div>

          {/* Sessions per patient */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className={cn("flex items-center gap-1 text-xs font-medium", backgroundImage && "text-white/90")}>
                <Zap className="h-3 w-3 text-gold" />
                שאילתות AI למטופל
              </label>
              <span className={cn("text-sm font-bold", backgroundImage ? "text-gold" : "text-gold-dark")}>{sessionsPerPatient}</span>
            </div>
            <Slider
              value={[sessionsPerPatient]}
              onValueChange={(value) => setSessionsPerPatient(value[0])}
              min={1}
              max={6}
              step={1}
              className="w-full"
            />
          </div>
        </div>

        {/* Projection */}
        <div className={cn(
          "rounded-lg p-3 border",
          willExceed 
            ? backgroundImage ? "bg-destructive/20 border-destructive/30" : "bg-destructive/10 border-destructive/20"
            : backgroundImage ? "bg-jade/20 border-jade/30" : "bg-jade/10 border-jade/20"
        )}>
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-1">
              <TrendingUp className={cn("h-4 w-4", willExceed ? "text-destructive" : "text-jade")} />
              <span className={cn("text-xs font-medium", backgroundImage && "text-white/90")}>צריכה צפויה</span>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button className={cn("transition-colors", backgroundImage ? "text-white/50 hover:text-white" : "text-muted-foreground hover:text-foreground")}>
                      <Info className="h-3 w-3" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="max-w-xs text-right">
                    <p>{monthlyPatients} מטופלים × {sessionsPerPatient} שאילתות = ~{estimatedQueries} שאילתות/חודש</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <span className={cn("text-sm font-bold", willExceed ? "text-destructive" : "text-jade")}>
              ~{estimatedQueries} שאילתות
            </span>
          </div>
          
          {/* Visual bar showing projection vs limit */}
          <div className={cn("relative h-2 rounded-full overflow-hidden", backgroundImage ? "bg-white/20" : "bg-muted")}>
            <div 
              className={cn(
                "absolute inset-y-0 right-0 rounded-full transition-all duration-300",
                willExceed ? "bg-destructive" : "bg-jade"
              )}
              style={{ width: `${Math.min(usageProjection, 100)}%` }}
            />
            {willExceed && (
              <div 
                className="absolute inset-y-0 bg-destructive/40 rounded-full"
                style={{ width: '100%' }}
              />
            )}
          </div>
          
          <p className={cn("text-xs mt-1", backgroundImage ? "text-white/60" : "text-muted-foreground")}>
            {willExceed 
              ? `חורג ב-${estimatedQueries - tierLimit} שאילתות מהתוכנית הנוכחית`
              : `${Math.round((1 - estimatedQueries / tierLimit) * 100)}% מהתוכנית יישאר פנוי`
            }
          </p>
        </div>

        {/* Upgrade CTA if exceeding */}
        {willExceed && tier !== 'premium' && (
          <Link to="/pricing">
            <Button
              size="sm"
              className="w-full gap-2 bg-gradient-to-l from-purple-600 to-jade hover:from-purple-700 hover:to-jade-dark text-white"
            >
              <Sparkles className="w-4 h-4" />
              שדרג תוכנית
            </Button>
          </Link>
        )}
      </CardContent>
    </Card>
  );
}
