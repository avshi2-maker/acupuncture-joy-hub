-- Create session_reports table to store generated reports
CREATE TABLE public.session_reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  therapist_id UUID NOT NULL,
  summary TEXT NOT NULL,
  audio_url TEXT,
  pdf_url TEXT,
  voice_used TEXT,
  session_notes TEXT,
  chief_complaint TEXT,
  anxiety_responses JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.session_reports ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Therapists can view their own reports"
ON public.session_reports
FOR SELECT
USING (auth.uid() = therapist_id);

CREATE POLICY "Therapists can create reports"
ON public.session_reports
FOR INSERT
WITH CHECK (auth.uid() = therapist_id);

CREATE POLICY "Therapists can update their own reports"
ON public.session_reports
FOR UPDATE
USING (auth.uid() = therapist_id);

CREATE POLICY "Therapists can delete their own reports"
ON public.session_reports
FOR DELETE
USING (auth.uid() = therapist_id);

-- Create trigger for updated_at
CREATE TRIGGER update_session_reports_updated_at
BEFORE UPDATE ON public.session_reports
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Add index for faster lookups
CREATE INDEX idx_session_reports_patient_id ON public.session_reports(patient_id);
CREATE INDEX idx_session_reports_therapist_id ON public.session_reports(therapist_id);