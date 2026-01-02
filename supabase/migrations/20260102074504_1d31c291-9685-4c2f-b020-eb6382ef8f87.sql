-- Create clinical_trials table for ClinicalTrials.gov data integration
CREATE TABLE public.clinical_trials (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nct_id text UNIQUE, -- ClinicalTrials.gov ID (e.g., NCT01234567)
  title text NOT NULL,
  condition text NOT NULL,
  condition_mesh_terms text[], -- MeSH standardized terms
  icd11_code text, -- WHO ICD-11 code (e.g., MG30.01 for Liver Qi Stagnation)
  icd11_description text,
  intervention text,
  points_used text[], -- Acupuncture points used
  herbal_formula text,
  study_status text DEFAULT 'completed', -- completed, recruiting, terminated
  phase text, -- Phase 1, 2, 3, 4
  enrollment integer,
  start_date date,
  completion_date date,
  primary_outcome text,
  results_summary text,
  efficacy_rating text, -- positive, negative, neutral, inconclusive
  source_url text,
  citation text, -- For CC-BY attribution
  license text DEFAULT 'public_domain',
  sapir_verified boolean DEFAULT false,
  sapir_notes text,
  verified_at timestamp with time zone,
  data_source text DEFAULT 'clinicaltrials.gov', -- clinicaltrials.gov, pmc, ecam
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.clinical_trials ENABLE ROW LEVEL SECURITY;

-- Policies: Public read, admin write
CREATE POLICY "Authenticated users can read clinical trials"
ON public.clinical_trials FOR SELECT
USING (true);

CREATE POLICY "Admins can manage clinical trials"
ON public.clinical_trials FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Indexes for common queries
CREATE INDEX idx_clinical_trials_condition ON public.clinical_trials(condition);
CREATE INDEX idx_clinical_trials_icd11 ON public.clinical_trials(icd11_code);
CREATE INDEX idx_clinical_trials_points ON public.clinical_trials USING GIN(points_used);
CREATE INDEX idx_clinical_trials_verified ON public.clinical_trials(sapir_verified);

-- Trigger for updated_at
CREATE TRIGGER update_clinical_trials_updated_at
BEFORE UPDATE ON public.clinical_trials
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();