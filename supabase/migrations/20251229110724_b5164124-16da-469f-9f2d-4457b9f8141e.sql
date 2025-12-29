-- Add booking contact field to clinics
ALTER TABLE public.clinics 
ADD COLUMN IF NOT EXISTS booking_contact_name text,
ADD COLUMN IF NOT EXISTS booking_contact_phone text;