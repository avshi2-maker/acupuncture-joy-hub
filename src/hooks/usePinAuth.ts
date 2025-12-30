import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

// Simple hash function for PIN (client-side, combined with server verification)
const hashPin = async (pin: string, salt: string): Promise<string> => {
  const data = new TextEncoder().encode(pin + salt);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
};

export function usePinAuth() {
  const [hasPin, setHasPin] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const [lockoutEndTime, setLockoutEndTime] = useState<Date | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check if user has a PIN set
  const checkPinStatus = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setHasPin(false);
        setIsLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('therapist_pins')
        .select('id, locked_until')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;

      setHasPin(!!data);
      
      if (data?.locked_until) {
        const lockEnd = new Date(data.locked_until);
        if (lockEnd > new Date()) {
          setIsLocked(true);
          setLockoutEndTime(lockEnd);
        } else {
          setIsLocked(false);
          setLockoutEndTime(null);
        }
      }
    } catch (err) {
      console.error('Error checking PIN status:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    checkPinStatus();
  }, [checkPinStatus]);

  // Set up a new PIN
  const setPin = useCallback(async (pin: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return { success: false, error: 'Not authenticated' };

      if (pin.length !== 4 || !/^\d{4}$/.test(pin)) {
        return { success: false, error: 'PIN must be 4 digits' };
      }

      const pinHash = await hashPin(pin, user.id);

      const { error } = await supabase
        .from('therapist_pins')
        .upsert({
          user_id: user.id,
          pin_hash: pinHash,
          failed_attempts: 0,
          locked_until: null,
        }, {
          onConflict: 'user_id'
        });

      if (error) throw error;

      setHasPin(true);
      return { success: true };
    } catch (err) {
      console.error('Error setting PIN:', err);
      return { success: false, error: 'Failed to set PIN' };
    }
  }, []);

  // Verify PIN
  const verifyPin = useCallback(async (pin: string): Promise<{ success: boolean; error?: string; attemptsRemaining?: number }> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return { success: false, error: 'Not authenticated' };

      const pinHash = await hashPin(pin, user.id);

      const { data, error } = await supabase
        .rpc('verify_therapist_pin', {
          p_user_id: user.id,
          p_pin_hash: pinHash
        });

      if (error) throw error;

      const result = data as { success: boolean; error?: string; attempts_remaining?: number; locked_until?: string };

      if (result.locked_until) {
        setIsLocked(true);
        setLockoutEndTime(new Date(result.locked_until));
      }

      return {
        success: result.success,
        error: result.error,
        attemptsRemaining: result.attempts_remaining
      };
    } catch (err) {
      console.error('Error verifying PIN:', err);
      return { success: false, error: 'Failed to verify PIN' };
    }
  }, []);

  // Remove PIN
  const removePin = useCallback(async (): Promise<{ success: boolean; error?: string }> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return { success: false, error: 'Not authenticated' };

      const { error } = await supabase
        .from('therapist_pins')
        .delete()
        .eq('user_id', user.id);

      if (error) throw error;

      setHasPin(false);
      return { success: true };
    } catch (err) {
      console.error('Error removing PIN:', err);
      return { success: false, error: 'Failed to remove PIN' };
    }
  }, []);

  return {
    hasPin,
    isLocked,
    lockoutEndTime,
    isLoading,
    setPin,
    verifyPin,
    removePin,
    checkPinStatus,
  };
}
