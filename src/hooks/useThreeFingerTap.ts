import { useRef, useCallback, useEffect } from 'react';

interface ThreeFingerTapOptions {
  onTripleTap: () => void;
  timeLimit?: number; // max time window for all fingers to touch (ms)
}

export function useThreeFingerTap({
  onTripleTap,
  timeLimit = 300,
}: ThreeFingerTapOptions) {
  const touchesRef = useRef<number>(0);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleTouchStart = useCallback((e: TouchEvent) => {
    // Check if three fingers touched at once
    if (e.touches.length >= 3) {
      touchesRef.current = e.touches.length;
      
      // Clear any existing timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      
      // Set a timeout to reset
      timeoutRef.current = setTimeout(() => {
        touchesRef.current = 0;
      }, timeLimit);
    }
  }, [timeLimit]);

  const handleTouchEnd = useCallback((e: TouchEvent) => {
    // If we had 3+ fingers and now releasing
    if (touchesRef.current >= 3 && e.touches.length === 0) {
      onTripleTap();
      touchesRef.current = 0;
      
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    }
  }, [onTripleTap]);

  useEffect(() => {
    document.addEventListener('touchstart', handleTouchStart, { passive: true });
    document.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchend', handleTouchEnd);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [handleTouchStart, handleTouchEnd]);
}
