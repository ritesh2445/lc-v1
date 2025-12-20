-- Drop all existing storage policies and recreate them properly
DROP POLICY IF EXISTS "Admins can upload banner images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can update banner images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete banner images" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view banner images" ON storage.objects;

DROP POLICY IF EXISTS "Admins can upload founder images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can update founder images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete founder images" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view founder images" ON storage.objects;

DROP POLICY IF EXISTS "Admins can upload service images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can update service images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete service images" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view service images" ON storage.objects;

DROP POLICY IF EXISTS "Admins can upload volunteer images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can update volunteer images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete volunteer images" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view volunteer images" ON storage.objects;

DROP POLICY IF EXISTS "Admins can upload memory lane images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can update memory lane images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete memory lane images" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view memory lane images" ON storage.objects;

DROP POLICY IF EXISTS "Admins can upload testimonial videos" ON storage.objects;
DROP POLICY IF EXISTS "Admins can update testimonial videos" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete testimonial videos" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view testimonial videos" ON storage.objects;

-- Create a single comprehensive policy for admin uploads to any bucket
CREATE POLICY "Admins can upload to any bucket"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  public.has_role(auth.uid(), 'admin'::app_role)
);

CREATE POLICY "Admins can update any object"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  public.has_role(auth.uid(), 'admin'::app_role)
);

CREATE POLICY "Admins can delete any object"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  public.has_role(auth.uid(), 'admin'::app_role)
);

CREATE POLICY "Public read access for all buckets"
ON storage.objects
FOR SELECT
TO public
USING (true);