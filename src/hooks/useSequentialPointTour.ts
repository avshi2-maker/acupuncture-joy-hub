import { useState, useCallback, useRef, useEffect } from 'react';

interface TourState {
  isRunning: boolean;
  isPaused: boolean;
  currentIndex: number;
  currentPoint: string | null;
  totalPoints: number;
}

interface UseSequentialPointTourOptions {
  /** Dwell time on each point in milliseconds (default: 2500ms) */
  dwellTime?: number;
  /** Called when the tour moves to a new point */
  onPointChange?: (point: string, index: number) => void;
  /** Called when the tour completes */
  onTourComplete?: () => void;
  /** Called when tour starts */
  onTourStart?: () => void;
  /** Whether to wait for external signal before moving to next point */
  waitForNarration?: boolean;
}

/**
 * Hook for managing sequential point celebration tours
 * Provides smooth camera transitions with pause/resume and manual navigation
 * Supports audio narration synchronization
 */
export function useSequentialPointTour(options: UseSequentialPointTourOptions = {}) {
  const { 
    dwellTime = 2500, 
    onPointChange, 
    onTourComplete,
    onTourStart,
    waitForNarration = false
  } = options;

  const [tourState, setTourState] = useState<TourState>({
    isRunning: false,
    isPaused: false,
    currentIndex: -1,
    currentPoint: null,
    totalPoints: 0,
  });

  const pointsRef = useRef<string[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const waitingForNarrationRef = useRef(false);

  // Clear any running timer
  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  // Move to a specific point
  const goToPoint = useCallback((index: number) => {
    if (index < 0 || index >= pointsRef.current.length) return;

    const point = pointsRef.current[index];
    
    setTourState(prev => ({
      ...prev,
      currentIndex: index,
      currentPoint: point,
    }));

    onPointChange?.(point, index);
  }, [onPointChange]);

  // Schedule next point
  const scheduleNextPoint = useCallback(() => {
    clearTimer();
    
    // If waiting for narration, don't auto-advance
    if (waitForNarration) {
      waitingForNarrationRef.current = true;
      return;
    }
    
    timerRef.current = setTimeout(() => {
      setTourState(prev => {
        const nextIndex = prev.currentIndex + 1;
        
        if (nextIndex >= pointsRef.current.length) {
          // Tour complete
          onTourComplete?.();
          return {
            ...prev,
            isRunning: false,
            isPaused: false,
            currentIndex: -1,
            currentPoint: null,
          };
        }

        // Move to next point
        if (!prev.isPaused) {
          const point = pointsRef.current[nextIndex];
          onPointChange?.(point, nextIndex);
          
          // Schedule the next one
          setTimeout(() => scheduleNextPoint(), 100);
          
          return {
            ...prev,
            currentIndex: nextIndex,
            currentPoint: point,
          };
        }

        return prev;
      });
    }, dwellTime);
  }, [dwellTime, onPointChange, onTourComplete, clearTimer, waitForNarration]);

  // Signal that narration is complete - advance to next point
  const signalNarrationComplete = useCallback(() => {
    if (!waitingForNarrationRef.current) return;
    
    waitingForNarrationRef.current = false;
    
    setTourState(prev => {
      if (!prev.isRunning || prev.isPaused) return prev;
      
      const nextIndex = prev.currentIndex + 1;
      
      if (nextIndex >= pointsRef.current.length) {
        // Tour complete
        onTourComplete?.();
        return {
          ...prev,
          isRunning: false,
          isPaused: false,
          currentIndex: -1,
          currentPoint: null,
        };
      }

      // Move to next point
      const point = pointsRef.current[nextIndex];
      onPointChange?.(point, nextIndex);
      
      // Schedule narration wait for next point
      waitingForNarrationRef.current = true;
      
      return {
        ...prev,
        currentIndex: nextIndex,
        currentPoint: point,
      };
    });
  }, [onPointChange, onTourComplete]);

  // Start the tour
  const startTour = useCallback((points: string[]) => {
    if (points.length === 0) return;

    clearTimer();
    pointsRef.current = points;
    waitingForNarrationRef.current = false;

    setTourState({
      isRunning: true,
      isPaused: false,
      currentIndex: 0,
      currentPoint: points[0],
      totalPoints: points.length,
    });

    onTourStart?.();
    onPointChange?.(points[0], 0);

    // Schedule the transition to the next point
    if (waitForNarration) {
      waitingForNarrationRef.current = true;
    } else {
      timerRef.current = setTimeout(() => {
        scheduleNextPoint();
      }, dwellTime);
    }
  }, [dwellTime, onPointChange, onTourStart, scheduleNextPoint, clearTimer, waitForNarration]);

  // Pause the tour
  const pauseTour = useCallback(() => {
    clearTimer();
    waitingForNarrationRef.current = false;
    setTourState(prev => ({
      ...prev,
      isPaused: true,
    }));
  }, [clearTimer]);

  // Resume the tour
  const resumeTour = useCallback(() => {
    setTourState(prev => ({
      ...prev,
      isPaused: false,
    }));
    
    // Continue from current point
    if (waitForNarration) {
      waitingForNarrationRef.current = true;
    } else {
      scheduleNextPoint();
    }
  }, [scheduleNextPoint, waitForNarration]);

  // Stop the tour
  const stopTour = useCallback(() => {
    clearTimer();
    waitingForNarrationRef.current = false;
    setTourState({
      isRunning: false,
      isPaused: false,
      currentIndex: -1,
      currentPoint: null,
      totalPoints: 0,
    });
  }, [clearTimer]);

  // Jump to a specific point (manual navigation)
  const jumpToPoint = useCallback((pointCode: string) => {
    const index = pointsRef.current.findIndex(
      p => p.toUpperCase() === pointCode.toUpperCase()
    );
    
    if (index !== -1) {
      clearTimer();
      waitingForNarrationRef.current = false;
      goToPoint(index);
      
      // If tour is running and not paused, resume scheduling
      if (tourState.isRunning && !tourState.isPaused) {
        if (waitForNarration) {
          waitingForNarrationRef.current = true;
        } else {
          timerRef.current = setTimeout(() => {
            scheduleNextPoint();
          }, dwellTime);
        }
      }
    }
  }, [tourState.isRunning, tourState.isPaused, dwellTime, goToPoint, scheduleNextPoint, clearTimer, waitForNarration]);

  // Navigate to next point manually
  const nextPoint = useCallback(() => {
    const nextIndex = tourState.currentIndex + 1;
    if (nextIndex < pointsRef.current.length) {
      clearTimer();
      waitingForNarrationRef.current = false;
      goToPoint(nextIndex);
      
      if (tourState.isRunning && !tourState.isPaused) {
        if (waitForNarration) {
          waitingForNarrationRef.current = true;
        } else {
          timerRef.current = setTimeout(() => {
            scheduleNextPoint();
          }, dwellTime);
        }
      }
    }
  }, [tourState, dwellTime, goToPoint, scheduleNextPoint, clearTimer, waitForNarration]);

  // Navigate to previous point manually
  const previousPoint = useCallback(() => {
    const prevIndex = tourState.currentIndex - 1;
    if (prevIndex >= 0) {
      clearTimer();
      waitingForNarrationRef.current = false;
      goToPoint(prevIndex);
      
      if (tourState.isRunning && !tourState.isPaused) {
        if (waitForNarration) {
          waitingForNarrationRef.current = true;
        } else {
          timerRef.current = setTimeout(() => {
            scheduleNextPoint();
          }, dwellTime);
        }
      }
    }
  }, [tourState, dwellTime, goToPoint, scheduleNextPoint, clearTimer, waitForNarration]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearTimer();
    };
  }, [clearTimer]);

  return {
    // State
    isRunning: tourState.isRunning,
    isPaused: tourState.isPaused,
    currentPoint: tourState.currentPoint,
    currentIndex: tourState.currentIndex,
    totalPoints: tourState.totalPoints,
    progress: tourState.totalPoints > 0 
      ? ((tourState.currentIndex + 1) / tourState.totalPoints) * 100 
      : 0,
    
    // Actions
    startTour,
    pauseTour,
    resumeTour,
    stopTour,
    jumpToPoint,
    nextPoint,
    previousPoint,
    signalNarrationComplete,
  };
}
