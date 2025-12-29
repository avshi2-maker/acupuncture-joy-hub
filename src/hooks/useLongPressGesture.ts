import { useRef, useCallback, useState } from 'react';

interface UseLongPressOptions {
  onLongPress: () => void;
  onPressStart?: () => void;
  onPressEnd?: () => void;
  delay?: number; // Time in ms before long press triggers
}

export const useLongPressGesture = ({ 
  onLongPress, 
  onPressStart,
  onPressEnd,
  delay = 500 
}: UseLongPressOptions) => {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isLongPressRef = useRef(false);
  const [isPressing, setIsPressing] = useState(false);
  const [progress, setProgress] = useState(0);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const start = useCallback((e: React.TouchEvent | React.MouseEvent) => {
    e.preventDefault();
    isLongPressRef.current = false;
    setIsPressing(true);
    setProgress(0);
    onPressStart?.();

    // Progress animation
    const startTime = Date.now();
    progressIntervalRef.current = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const newProgress = Math.min((elapsed / delay) * 100, 100);
      setProgress(newProgress);
    }, 16); // ~60fps

    timeoutRef.current = setTimeout(() => {
      isLongPressRef.current = true;
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
      setProgress(100);
      onLongPress();
    }, delay);
  }, [delay, onLongPress, onPressStart]);

  const clear = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }
    setIsPressing(false);
    setProgress(0);
    onPressEnd?.();
  }, [onPressEnd]);

  return {
    handlers: {
      onTouchStart: start,
      onTouchEnd: clear,
      onTouchCancel: clear,
      onMouseDown: start,
      onMouseUp: clear,
      onMouseLeave: clear,
    },
    isPressing,
    progress,
    isLongPress: isLongPressRef.current,
  };
};
