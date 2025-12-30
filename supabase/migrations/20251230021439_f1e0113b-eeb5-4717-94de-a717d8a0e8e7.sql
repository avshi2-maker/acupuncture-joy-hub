-- Create table to store therapist PIN codes (encrypted)
CREATE TABLE public.therapist_pins (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  pin_hash text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  failed_attempts integer NOT NULL DEFAULT 0,
  locked_until timestamp with time zone
);

-- Enable RLS
ALTER TABLE public.therapist_pins ENABLE ROW LEVEL SECURITY;

-- Users can only manage their own PIN
CREATE POLICY "Users can view own pin"
ON public.therapist_pins
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create own pin"
ON public.therapist_pins
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own pin"
ON public.therapist_pins
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own pin"
ON public.therapist_pins
FOR DELETE
USING (auth.uid() = user_id);

-- Create index for fast lookup
CREATE INDEX idx_therapist_pins_user_id ON public.therapist_pins(user_id);

-- Create function to verify PIN and handle lockout
CREATE OR REPLACE FUNCTION public.verify_therapist_pin(p_user_id uuid, p_pin_hash text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_pin_record RECORD;
  v_max_attempts INTEGER := 5;
  v_lockout_minutes INTEGER := 15;
BEGIN
  SELECT * INTO v_pin_record FROM therapist_pins WHERE user_id = p_user_id;
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'PIN not set');
  END IF;
  
  -- Check if locked
  IF v_pin_record.locked_until IS NOT NULL AND v_pin_record.locked_until > now() THEN
    RETURN jsonb_build_object(
      'success', false, 
      'error', 'Account locked', 
      'locked_until', v_pin_record.locked_until
    );
  END IF;
  
  -- Verify PIN
  IF v_pin_record.pin_hash = p_pin_hash THEN
    -- Reset failed attempts on success
    UPDATE therapist_pins 
    SET failed_attempts = 0, locked_until = NULL, updated_at = now()
    WHERE user_id = p_user_id;
    
    RETURN jsonb_build_object('success', true);
  ELSE
    -- Increment failed attempts
    UPDATE therapist_pins 
    SET 
      failed_attempts = failed_attempts + 1,
      locked_until = CASE 
        WHEN failed_attempts + 1 >= v_max_attempts THEN now() + (v_lockout_minutes || ' minutes')::interval
        ELSE NULL
      END,
      updated_at = now()
    WHERE user_id = p_user_id;
    
    RETURN jsonb_build_object(
      'success', false, 
      'error', 'Invalid PIN',
      'attempts_remaining', v_max_attempts - v_pin_record.failed_attempts - 1
    );
  END IF;
END;
$$;