-- Grant admin role to the current user (adminlc@gmail.com)
INSERT INTO public.user_roles (user_id, role)
VALUES ('4b595aa8-d9aa-44e1-88cd-1b09b5ab05fb', 'admin')
ON CONFLICT (user_id, role) DO NOTHING;

-- Create RLS policies for memory-lane storage bucket
-- Allow admins to upload images
CREATE POLICY "Admins can upload to memory-lane"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'memory-lane' 
  AND has_role(auth.uid(), 'admin'::app_role)
);

-- Allow admins to update images
CREATE POLICY "Admins can update memory-lane images"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'memory-lane'
  AND has_role(auth.uid(), 'admin'::app_role)
);

-- Allow admins to delete images
CREATE POLICY "Admins can delete from memory-lane"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'memory-lane'
  AND has_role(auth.uid(), 'admin'::app_role)
);

-- Allow public read access to images
CREATE POLICY "Public can view memory-lane images"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'memory-lane');