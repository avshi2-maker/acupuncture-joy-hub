import { useEffect, useRef, useCallback, useState } from 'react';
import { toast } from 'sonner';

interface AutoSaveData {
  messages: Array<{ role: 'user' | 'assistant'; content: string }>;
  questionsAsked: string[];
  sessionSeconds: number;
  patientId?: string;
  patientName?: string;
  activeTemplate?: string | null;
}

const AUTOSAVE_KEY = 'tcm_brain_autosave';
const AUTOSAVE_INTERVAL = 30000; // 30 seconds

export function useAutoSave(
  data: AutoSaveData,
  isSessionRunning: boolean
) {
  const [lastSaveTime, setLastSaveTime] = useState<Date | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const previousDataRef = useRef<string>('');

  const save = useCallback(() => {
    if (!isSessionRunning) return;
    
    const currentData = JSON.stringify(data);
    
    // Only save if data has changed
    if (currentData === previousDataRef.current) return;
    
    setIsSaving(true);
    
    try {
      const saveData = {
        ...data,
        savedAt: new Date().toISOString(),
      };
      
      localStorage.setItem(AUTOSAVE_KEY, JSON.stringify(saveData));
      previousDataRef.current = currentData;
      setLastSaveTime(new Date());
      console.log('[AutoSave] Session saved');
    } catch (error) {
      console.error('[AutoSave] Failed:', error);
    } finally {
      setIsSaving(false);
    }
  }, [data, isSessionRunning]);

  // Auto-save on interval
  useEffect(() => {
    if (!isSessionRunning) return;

    const interval = setInterval(save, AUTOSAVE_INTERVAL);
    return () => clearInterval(interval);
  }, [isSessionRunning, save]);

  // Save on data change (debounced)
  useEffect(() => {
    if (!isSessionRunning) return;

    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    
    saveTimeoutRef.current = setTimeout(save, 5000); // 5 second debounce
    
    return () => {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    };
  }, [data, isSessionRunning, save]);

  // Save on unmount if session is running
  useEffect(() => {
    return () => {
      if (isSessionRunning) save();
    };
  }, [isSessionRunning, save]);

  // Load saved session
  const loadSavedSession = useCallback((): AutoSaveData | null => {
    try {
      const saved = localStorage.getItem(AUTOSAVE_KEY);
      if (!saved) return null;
      
      const parsed = JSON.parse(saved);
      const savedAt = new Date(parsed.savedAt);
      const hoursSince = (Date.now() - savedAt.getTime()) / (1000 * 60 * 60);
      
      // Only restore if less than 24 hours old
      if (hoursSince > 24) {
        localStorage.removeItem(AUTOSAVE_KEY);
        return null;
      }
      
      return parsed;
    } catch {
      return null;
    }
  }, []);

  // Clear saved session
  const clearSavedSession = useCallback(() => {
    localStorage.removeItem(AUTOSAVE_KEY);
    previousDataRef.current = '';
  }, []);

  // Manual trigger for immediate save
  const saveNow = useCallback(() => {
    save();
    toast.success('Session auto-saved', { duration: 1500 });
  }, [save]);

  return {
    lastSaveTime,
    isSaving,
    loadSavedSession,
    clearSavedSession,
    saveNow,
  };
}
