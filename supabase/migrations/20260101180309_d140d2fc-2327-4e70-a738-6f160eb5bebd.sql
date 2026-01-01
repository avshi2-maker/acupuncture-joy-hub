-- Create retreat quiz results table
CREATE TABLE public.retreat_quiz_results (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE,
  therapist_id UUID NOT NULL,
  score INTEGER NOT NULL,
  status TEXT NOT NULL,
  collected_tcm JSONB NOT NULL DEFAULT '[]'::jsonb,
  total_questions INTEGER NOT NULL,
  answered_yes INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.retreat_quiz_results ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Therapists can create quiz results"
ON public.retreat_quiz_results
FOR INSERT
WITH CHECK (auth.uid() = therapist_id);

CREATE POLICY "Therapists can view own quiz results"
ON public.retreat_quiz_results
FOR SELECT
USING (auth.uid() = therapist_id);

CREATE POLICY "Therapists can delete own quiz results"
ON public.retreat_quiz_results
FOR DELETE
USING (auth.uid() = therapist_id);

-- Create index for faster lookups
CREATE INDEX idx_retreat_quiz_results_patient ON public.retreat_quiz_results(patient_id);
CREATE INDEX idx_retreat_quiz_results_therapist ON public.retreat_quiz_results(therapist_id);