-- Create storage bucket for patient signatures
INSERT INTO storage.buckets (id, name, public) 
VALUES ('signatures', 'signatures', false)
ON CONFLICT (id) DO NOTHING;

-- Create policy for therapists to upload signatures for their patients
CREATE POLICY "Therapists can upload signatures"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'signatures' 
  AND auth.uid() IS NOT NULL
);

-- Create policy for therapists to view signatures
CREATE POLICY "Therapists can view signatures"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'signatures' 
  AND auth.uid() IS NOT NULL
);

-- Create policy for therapists to update signatures
CREATE POLICY "Therapists can update signatures"
ON storage.objects
FOR UPDATE
USING (
  bucket_id = 'signatures' 
  AND auth.uid() IS NOT NULL
);

-- Create policy for therapists to delete signatures
CREATE POLICY "Therapists can delete signatures"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'signatures' 
  AND auth.uid() IS NOT NULL
);