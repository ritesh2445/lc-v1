-- Create storage bucket for volunteer images
INSERT INTO storage.buckets (id, name, public)
VALUES ('volunteer-images', 'volunteer-images', true);

-- Allow public read access
CREATE POLICY "Anyone can view volunteer images"
ON storage.objects FOR SELECT
USING (bucket_id = 'volunteer-images');

-- Allow admins to upload volunteer images
CREATE POLICY "Admins can upload volunteer images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'volunteer-images' AND has_role(auth.uid(), 'admin'::app_role));

-- Allow admins to update volunteer images
CREATE POLICY "Admins can update volunteer images"
ON storage.objects FOR UPDATE
USING (bucket_id = 'volunteer-images' AND has_role(auth.uid(), 'admin'::app_role));

-- Allow admins to delete volunteer images
CREATE POLICY "Admins can delete volunteer images"
ON storage.objects FOR DELETE
USING (bucket_id = 'volunteer-images' AND has_role(auth.uid(), 'admin'::app_role));