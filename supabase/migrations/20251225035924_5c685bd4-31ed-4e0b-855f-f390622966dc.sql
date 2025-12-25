-- Create herbs table
CREATE TABLE public.herbs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name_english TEXT NOT NULL,
  name_chinese TEXT NOT NULL,
  name_pinyin TEXT NOT NULL,
  category TEXT NOT NULL,
  nature TEXT, -- warm, cool, neutral, hot, cold
  flavor TEXT[], -- sweet, sour, bitter, pungent, salty
  meridians TEXT[], -- liver, heart, spleen, lung, kidney, etc.
  actions TEXT[],
  indications TEXT[],
  contraindications TEXT[],
  dosage TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create acupuncture_points table
CREATE TABLE public.acupuncture_points (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name_english TEXT NOT NULL,
  name_chinese TEXT NOT NULL,
  name_pinyin TEXT NOT NULL,
  code TEXT NOT NULL, -- e.g., LI4, ST36
  meridian TEXT NOT NULL,
  location TEXT NOT NULL,
  depth TEXT, -- needling depth
  actions TEXT[],
  indications TEXT[],
  contraindications TEXT[],
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create conditions table
CREATE TABLE public.conditions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name_english TEXT NOT NULL,
  name_chinese TEXT,
  tcm_patterns TEXT[],
  symptoms TEXT[],
  treatment_principles TEXT[],
  recommended_points TEXT[],
  recommended_herbs TEXT[],
  lifestyle_advice TEXT[],
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.herbs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.acupuncture_points ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conditions ENABLE ROW LEVEL SECURITY;

-- RLS Policies - all authenticated users can read (therapists with valid password)
CREATE POLICY "Authenticated users can read herbs"
ON public.herbs FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can read acupuncture_points"
ON public.acupuncture_points FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can read conditions"
ON public.conditions FOR SELECT TO authenticated USING (true);

-- Admins can manage all knowledge
CREATE POLICY "Admins can manage herbs"
ON public.herbs FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage acupuncture_points"
ON public.acupuncture_points FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage conditions"
ON public.conditions FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Create indexes for search
CREATE INDEX idx_herbs_name ON public.herbs USING gin (to_tsvector('english', name_english || ' ' || name_pinyin));
CREATE INDEX idx_points_name ON public.acupuncture_points USING gin (to_tsvector('english', name_english || ' ' || name_pinyin || ' ' || code));
CREATE INDEX idx_conditions_name ON public.conditions USING gin (to_tsvector('english', name_english));