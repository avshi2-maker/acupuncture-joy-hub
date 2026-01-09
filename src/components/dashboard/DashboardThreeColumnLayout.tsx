import { ReactNode, memo } from 'react';
import { cn } from '@/lib/utils';

interface DashboardThreeColumnLayoutProps {
  rightColumn: ReactNode;
  centerColumn: ReactNode;
  leftColumn: ReactNode;
  className?: string;
}

/**
 * 3-Column RTL Grid Layout for Dashboard
 * Distribution: 25% | 50% | 25%
 * 
 * Right (25%): Action - Workflow, Feature Cards, Assessment
 * Center (50%): Intelligence Hub - Stats, AI, Knowledge
 * Left (25%): Visual/Status - Clock, Galleries, Wallet
 */
export const DashboardThreeColumnLayout = memo(function DashboardThreeColumnLayout({
  rightColumn,
  centerColumn,
  leftColumn,
  className,
}: DashboardThreeColumnLayoutProps) {
  return (
    <div 
      className={cn(
        // RTL 3-column grid: 25% | 50% | 25%
        "grid grid-cols-1 lg:grid-cols-4 gap-4 lg:gap-6",
        "w-full",
        className
      )}
      dir="rtl"
    >
      {/* Column 1 (Right): Action - 25% */}
      <div className="lg:col-span-1 flex flex-col gap-4 order-1">
        {rightColumn}
      </div>

      {/* Column 2 (Center): Intelligence Hub - 50% */}
      <div className="lg:col-span-2 flex flex-col gap-4 order-2">
        {centerColumn}
      </div>

      {/* Column 3 (Left): Visual/Status - 25% */}
      <div className="lg:col-span-1 flex flex-col gap-4 order-3">
        {leftColumn}
      </div>
    </div>
  );
});

/**
 * Glass UI Card Wrapper - Unified glassmorphism styling
 */
interface GlassCardProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
}

export const GlassCard = memo(function GlassCard({ children, className, onClick }: GlassCardProps) {
  return (
    <div 
      className={cn(
        // Glass UI styling
        "bg-white/40 dark:bg-card/40",
        "backdrop-blur-xl",
        "border border-jade/20 dark:border-jade/30",
        "rounded-xl",
        "shadow-lg shadow-jade/5",
        "transition-all duration-200",
        "hover:bg-white/50 dark:hover:bg-card/50",
        "hover:shadow-xl hover:shadow-jade/10",
        onClick && "cursor-pointer",
        className
      )}
      onClick={onClick}
    >
      {children}
    </div>
  );
});

/**
 * Dashboard Section Header
 */
interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  icon?: ReactNode;
  className?: string;
}

export const DashboardSectionHeader = memo(function DashboardSectionHeader({ 
  title, 
  subtitle, 
  icon,
  className 
}: SectionHeaderProps) {
  return (
    <div className={cn("flex items-center gap-3 mb-4", className)}>
      {icon && (
        <div className="w-10 h-10 rounded-lg bg-jade/10 flex items-center justify-center">
          {icon}
        </div>
      )}
      <div>
        <h3 className="font-display text-lg font-semibold text-foreground">{title}</h3>
        {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
      </div>
    </div>
  );
});
