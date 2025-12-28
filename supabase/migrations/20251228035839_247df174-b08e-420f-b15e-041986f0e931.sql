-- Create table for storing signed therapist disclaimers
CREATE TABLE public.therapist_disclaimers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  therapist_name TEXT NOT NULL,
  license_number TEXT NOT NULL,
  language TEXT NOT NULL DEFAULT 'en',
  signature_url TEXT,
  signed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + INTERVAL '1 year'),
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.therapist_disclaimers ENABLE ROW LEVEL SECURITY;

-- Admins can view all disclaimers
CREATE POLICY "Admins can view all disclaimers"
ON public.therapist_disclaimers
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

-- Admins can manage disclaimers
CREATE POLICY "Admins can manage disclaimers"
ON public.therapist_disclaimers
FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- Users can create their own disclaimer
CREATE POLICY "Users can create own disclaimer"
ON public.therapist_disclaimers
FOR INSERT
WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- Users can view their own disclaimer
CREATE POLICY "Users can view own disclaimer"
ON public.therapist_disclaimers
FOR SELECT
USING (auth.uid() = user_id);

-- Create index for faster lookups
CREATE INDEX idx_therapist_disclaimers_user_id ON public.therapist_disclaimers(user_id);
CREATE INDEX idx_therapist_disclaimers_expires_at ON public.therapist_disclaimers(expires_at);