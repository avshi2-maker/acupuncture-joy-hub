import { useState, useCallback, useEffect, useRef } from 'react';

/**
 * Point Sparkle Sync Hook - Phase 5: RAG-to-Nexus Bridge
 * Detects point codes mentioned in AI responses and triggers sparkle animations
 */

// Common point code patterns
const POINT_REGEX = /\b([A-Z]{2,3}\d{1,2})\b/g;

// Point code to meridian mapping for validation
const VALID_MERIDIAN_PREFIXES = [
  'LU', 'LI', 'ST', 'SP', 'HT', 'SI', 'BL', 'KI', 'PC', 'TE', 'GB', 'LV',
  'CV', 'GV', 'RN', 'DU', 'EX', 'M', 'N'
];

interface SparklePoint {
  code: string;
  timestamp: number;
}

interface UsePointSparkleSyncOptions {
  enabled?: boolean;
  sparkleDelayMs?: number;
  sparkleDurationMs?: number;
  onPointSparkle?: (pointCodes: string[]) => void;
}

export function usePointSparkleSync(
  aiResponseText: string,
  options: UsePointSparkleSyncOptions = {}
) {
  const {
    enabled = true,
    sparkleDelayMs = 100,  // Stagger sparkle start
    sparkleDurationMs = 2000,
    onPointSparkle,
  } = options;

  const [sparklingPoints, setSparklingPoints] = useState<Map<string, SparklePoint>>(new Map());
  const [lastProcessedLength, setLastProcessedLength] = useState(0);
  const sparkleTimeoutsRef = useRef<Map<string, NodeJS.Timeout>>(new Map());

  // Validate if a code is a valid acupuncture point
  const isValidPointCode = useCallback((code: string): boolean => {
    const prefix = code.replace(/\d+/g, '');
    return VALID_MERIDIAN_PREFIXES.includes(prefix);
  }, []);

  // Extract point codes from text
  const extractPointCodes = useCallback((text: string): string[] => {
    const matches = text.match(POINT_REGEX) || [];
    return [...new Set(matches)].filter(isValidPointCode);
  }, [isValidPointCode]);

  // Trigger sparkle animation for a point
  const triggerSparkle = useCallback((pointCode: string) => {
    const point: SparklePoint = {
      code: pointCode,
      timestamp: Date.now(),
    };
    
    setSparklingPoints(prev => new Map(prev).set(pointCode, point));
    
    // Clear existing timeout
    const existingTimeout = sparkleTimeoutsRef.current.get(pointCode);
    if (existingTimeout) {
      clearTimeout(existingTimeout);
    }
    
    // Set timeout to remove sparkle
    const timeout = setTimeout(() => {
      setSparklingPoints(prev => {
        const next = new Map(prev);
        next.delete(pointCode);
        return next;
      });
      sparkleTimeoutsRef.current.delete(pointCode);
    }, sparkleDurationMs);
    
    sparkleTimeoutsRef.current.set(pointCode, timeout);
  }, [sparkleDurationMs]);

  // Process AI response text incrementally (for streaming)
  useEffect(() => {
    if (!enabled || !aiResponseText) return;
    
    // Only process new content
    if (aiResponseText.length <= lastProcessedLength) return;
    
    const newContent = aiResponseText.slice(lastProcessedLength);
    const newPoints = extractPointCodes(newContent);
    
    if (newPoints.length > 0) {
      // Stagger sparkle animations
      newPoints.forEach((point, index) => {
        if (!sparklingPoints.has(point)) {
          setTimeout(() => {
            triggerSparkle(point);
          }, index * sparkleDelayMs);
        }
      });
      
      // Notify callback
      onPointSparkle?.(newPoints);
      
      console.log('[Point Sparkle Sync] Detected points:', newPoints);
    }
    
    setLastProcessedLength(aiResponseText.length);
  }, [aiResponseText, enabled, lastProcessedLength, extractPointCodes, triggerSparkle, sparklingPoints, sparkleDelayMs, onPointSparkle]);

  // Reset when text is cleared
  useEffect(() => {
    if (!aiResponseText || aiResponseText.length === 0) {
      setLastProcessedLength(0);
      setSparklingPoints(new Map());
    }
  }, [aiResponseText]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      sparkleTimeoutsRef.current.forEach(timeout => clearTimeout(timeout));
      sparkleTimeoutsRef.current.clear();
    };
  }, []);

  // Check if a point is currently sparkling
  const isSparklingPoint = useCallback((pointCode: string): boolean => {
    return sparklingPoints.has(pointCode);
  }, [sparklingPoints]);

  // Get all currently sparkling point codes
  const sparklingPointCodes = Array.from(sparklingPoints.keys());

  // Manually trigger sparkles for specific points
  const triggerPointSparkles = useCallback((pointCodes: string[]) => {
    pointCodes.forEach((point, index) => {
      setTimeout(() => {
        triggerSparkle(point);
      }, index * sparkleDelayMs);
    });
  }, [triggerSparkle, sparkleDelayMs]);

  // Clear all sparkles
  const clearSparkles = useCallback(() => {
    setSparklingPoints(new Map());
    sparkleTimeoutsRef.current.forEach(timeout => clearTimeout(timeout));
    sparkleTimeoutsRef.current.clear();
    setLastProcessedLength(0);
  }, []);

  return {
    sparklingPoints: sparklingPointCodes,
    isSparklingPoint,
    triggerPointSparkles,
    clearSparkles,
    extractPointCodes,
  };
}
