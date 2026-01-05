-- Create table for Clinical Navigator subjects and questions
CREATE TABLE public.clinical_navigator_subjects (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  subject_name TEXT NOT NULL,
  subject_name_he TEXT,
  category TEXT NOT NULL DEFAULT 'general',
  icon_name TEXT DEFAULT 'BookOpen',
  color TEXT DEFAULT '#3B82F6',
  questions JSONB NOT NULL DEFAULT '[]'::jsonb,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.clinical_navigator_subjects ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read subjects
CREATE POLICY "Authenticated users can read clinical navigator subjects"
ON public.clinical_navigator_subjects
FOR SELECT
USING (is_active = true);

-- Allow admins to manage subjects
CREATE POLICY "Admins can manage clinical navigator subjects"
ON public.clinical_navigator_subjects
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create updated_at trigger
CREATE TRIGGER update_clinical_navigator_subjects_updated_at
BEFORE UPDATE ON public.clinical_navigator_subjects
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert sample clinical subjects with questions
INSERT INTO public.clinical_navigator_subjects (subject_name, subject_name_he, category, icon_name, color, sort_order, questions) VALUES
('Before First Treatment', 'לפני טיפול ראשון', 'intake', 'ClipboardList', '#3B82F6', 1, '[
  {"id": "chief_complaint", "question": "What brings you in today?", "question_he": "מה מביא אותך היום?", "type": "open"},
  {"id": "symptom_duration", "question": "How long have you had these symptoms?", "question_he": "כמה זמן יש לך את התסמינים?", "type": "open"},
  {"id": "previous_treatment", "question": "Have you tried any treatments before?", "question_he": "האם ניסית טיפולים בעבר?", "type": "open"},
  {"id": "medications", "question": "Are you currently taking any medications?", "question_he": "האם את/ה נוטל/ת תרופות?", "type": "open"},
  {"id": "allergies", "question": "Do you have any allergies?", "question_he": "האם יש לך אלרגיות?", "type": "open"}
]'::jsonb),
('During Treatment', 'במהלך הטיפול', 'session', 'Activity', '#10B981', 2, '[
  {"id": "sensation", "question": "What sensations do you feel?", "question_he": "מה את/ה מרגיש/ה?", "type": "open"},
  {"id": "discomfort", "question": "Any discomfort or pain?", "question_he": "יש אי נוחות או כאב?", "type": "scale"},
  {"id": "relaxation", "question": "How relaxed do you feel?", "question_he": "כמה את/ה מרגיש/ה רגוע/ה?", "type": "scale"}
]'::jsonb),
('Follow-up Assessment', 'הערכת מעקב', 'followup', 'TrendingUp', '#8B5CF6', 3, '[
  {"id": "symptom_change", "question": "How have your symptoms changed since last session?", "question_he": "איך השתנו התסמינים מאז הטיפול האחרון?", "type": "open"},
  {"id": "improvement_scale", "question": "On a scale of 1-10, how much improvement?", "question_he": "בסולם 1-10, כמה שיפור?", "type": "scale"},
  {"id": "new_symptoms", "question": "Any new symptoms or concerns?", "question_he": "תסמינים או דאגות חדשים?", "type": "open"}
]'::jsonb),
('Pain Assessment', 'הערכת כאב', 'diagnostic', 'Thermometer', '#EF4444', 4, '[
  {"id": "pain_location", "question": "Where exactly is the pain?", "question_he": "איפה בדיוק הכאב?", "type": "open"},
  {"id": "pain_type", "question": "Describe the pain type (sharp, dull, burning)?", "question_he": "תאר/י את סוג הכאב (חד, קהה, צורב)?", "type": "open"},
  {"id": "pain_intensity", "question": "Rate pain intensity 1-10", "question_he": "דרג/י עוצמת כאב 1-10", "type": "scale"},
  {"id": "pain_triggers", "question": "What makes it worse or better?", "question_he": "מה מחמיר או משפר?", "type": "open"}
]'::jsonb),
('Sleep Quality', 'איכות שינה', 'lifestyle', 'Moon', '#6366F1', 5, '[
  {"id": "sleep_hours", "question": "How many hours do you sleep?", "question_he": "כמה שעות את/ה ישן/ה?", "type": "open"},
  {"id": "sleep_quality", "question": "Rate your sleep quality 1-10", "question_he": "דרג/י איכות שינה 1-10", "type": "scale"},
  {"id": "falling_asleep", "question": "Difficulty falling asleep?", "question_he": "קושי להירדם?", "type": "open"},
  {"id": "waking_up", "question": "Do you wake during the night?", "question_he": "האם את/ה מתעורר/ת בלילה?", "type": "open"}
]'::jsonb);