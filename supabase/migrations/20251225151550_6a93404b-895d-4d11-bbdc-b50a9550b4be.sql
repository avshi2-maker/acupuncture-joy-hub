-- Create storage bucket for payment proofs
INSERT INTO storage.buckets (id, name, public)
VALUES ('payment-proofs', 'payment-proofs', false)
ON CONFLICT (id) DO NOTHING;

-- Allow anyone to upload payment proofs (no auth required for this flow)
CREATE POLICY "Anyone can upload payment proofs"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'payment-proofs');

-- Only admins can view payment proofs
CREATE POLICY "Admins can view payment proofs"
ON storage.objects FOR SELECT
USING (bucket_id = 'payment-proofs' AND EXISTS (
  SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin'
));