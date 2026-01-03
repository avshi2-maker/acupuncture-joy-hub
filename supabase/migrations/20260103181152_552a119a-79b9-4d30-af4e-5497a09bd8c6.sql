-- Create patient_assessments table to store all assessment results
CREATE TABLE public.patient_assessments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  therapist_id UUID NOT NULL,
  assessment_type TEXT NOT NULL CHECK (assessment_type IN ('brain', 'body', 'retreat')),
  score INTEGER,
  summary TEXT,
  details JSONB DEFAULT '{}'::jsonb,
  status TEXT NOT NULL DEFAULT 'saved' CHECK (status IN ('saved', 'sent', 'pending')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.patient_assessments ENABLE ROW LEVEL SECURITY;

-- Create policies for therapist access
CREATE POLICY "Therapists can view own patient assessments" 
ON public.patient_assessments 
FOR SELECT 
USING (auth.uid() = therapist_id);

CREATE POLICY "Therapists can create patient assessments" 
ON public.patient_assessments 
FOR INSERT 
WITH CHECK (auth.uid() = therapist_id);

CREATE POLICY "Therapists can update own patient assessments" 
ON public.patient_assessments 
FOR UPDATE 
USING (auth.uid() = therapist_id);

CREATE POLICY "Therapists can delete own patient assessments" 
ON public.patient_assessments 
FOR DELETE 
USING (auth.uid() = therapist_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_patient_assessments_updated_at
BEFORE UPDATE ON public.patient_assessments
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for faster queries
CREATE INDEX idx_patient_assessments_patient_id ON public.patient_assessments(patient_id);
CREATE INDEX idx_patient_assessments_therapist_id ON public.patient_assessments(therapist_id);
CREATE INDEX idx_patient_assessments_type ON public.patient_assessments(assessment_type);