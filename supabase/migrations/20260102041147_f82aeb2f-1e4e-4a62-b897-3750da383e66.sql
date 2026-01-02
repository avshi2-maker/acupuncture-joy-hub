-- Add landing page customization fields to clinics table
ALTER TABLE public.clinics 
ADD COLUMN IF NOT EXISTS landing_page_bg_url TEXT,
ADD COLUMN IF NOT EXISTS parking_instructions TEXT,
ADD COLUMN IF NOT EXISTS map_embed_url TEXT;