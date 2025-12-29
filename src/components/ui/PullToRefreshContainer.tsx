import { ReactNode } from 'react';
import { Loader2 } from 'lucide-react';
import { usePullToRefresh } from '@/hooks/usePullToRefresh';

interface PullToRefreshContainerProps {
  children: ReactNode;
  onRefresh: () => Promise<void>;
  className?: string;
}

/**
 * Wrapper component that adds pull-to-refresh functionality
 * Only active on mobile (touch devices)
 */
export function PullToRefreshContainer({
  children,
  onRefresh,
  className = '',
}: PullToRefreshContainerProps) {
  const { isRefreshing, pullDistance, handlers } = usePullToRefresh({
    onRefresh,
    threshold: 80,
  });

  return (
    <div 
      className={`relative ${className}`}
      {...handlers}
    >
      {/* Pull indicator */}
      <div 
        className="absolute left-0 right-0 flex justify-center items-center transition-opacity duration-200 pointer-events-none z-10"
        style={{
          top: Math.max(pullDistance - 40, -40),
          opacity: Math.min(pullDistance / 80, 1),
        }}
      >
        <div className={`bg-background border border-border rounded-full p-2 shadow-lg ${isRefreshing ? 'animate-spin' : ''}`}>
          <Loader2 className={`h-5 w-5 text-jade ${isRefreshing ? '' : 'opacity-60'}`} />
        </div>
      </div>

      {/* Content with pull offset */}
      <div 
        style={{
          transform: `translateY(${pullDistance}px)`,
          transition: pullDistance === 0 ? 'transform 0.2s ease-out' : 'none',
        }}
      >
        {children}
      </div>
    </div>
  );
}
