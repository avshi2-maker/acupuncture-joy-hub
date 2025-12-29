import { useState, useCallback, useRef, TouchEvent } from 'react';

interface UsePullToRefreshOptions {
  onRefresh: () => Promise<void>;
  threshold?: number; // Pull distance to trigger refresh (default: 80px)
}

interface UsePullToRefreshReturn {
  isRefreshing: boolean;
  pullDistance: number;
  handlers: {
    onTouchStart: (e: TouchEvent) => void;
    onTouchMove: (e: TouchEvent) => void;
    onTouchEnd: () => void;
  };
}

/**
 * Custom hook for pull-to-refresh functionality
 * Attach handlers to a scrollable container
 */
export function usePullToRefresh({
  onRefresh,
  threshold = 80,
}: UsePullToRefreshOptions): UsePullToRefreshReturn {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const startY = useRef<number>(0);
  const isAtTop = useRef<boolean>(true);

  const onTouchStart = useCallback((e: TouchEvent) => {
    // Only start tracking if we're at the top of the scroll container
    const target = e.currentTarget as HTMLElement;
    isAtTop.current = target.scrollTop <= 0;
    
    if (isAtTop.current && !isRefreshing) {
      startY.current = e.touches[0].clientY;
    }
  }, [isRefreshing]);

  const onTouchMove = useCallback((e: TouchEvent) => {
    if (!isAtTop.current || isRefreshing) return;

    const currentY = e.touches[0].clientY;
    const diff = currentY - startY.current;

    // Only track downward pulls
    if (diff > 0) {
      // Apply resistance (diminishing returns as you pull further)
      const resistance = 0.4;
      const adjustedDiff = diff * resistance;
      setPullDistance(Math.min(adjustedDiff, threshold * 1.5));
    }
  }, [isRefreshing, threshold]);

  const onTouchEnd = useCallback(async () => {
    if (pullDistance >= threshold && !isRefreshing) {
      setIsRefreshing(true);
      try {
        await onRefresh();
      } finally {
        setIsRefreshing(false);
      }
    }
    setPullDistance(0);
  }, [pullDistance, threshold, isRefreshing, onRefresh]);

  return {
    isRefreshing,
    pullDistance,
    handlers: {
      onTouchStart,
      onTouchMove,
      onTouchEnd,
    },
  };
}
