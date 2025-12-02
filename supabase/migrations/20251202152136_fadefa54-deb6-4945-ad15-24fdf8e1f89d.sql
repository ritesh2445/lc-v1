-- Create storage bucket for testimonial videos
INSERT INTO storage.buckets (id, name, public) 
VALUES ('testimonial-videos', 'testimonial-videos', true)
ON CONFLICT (id) DO NOTHING;

-- Create policies for testimonial videos bucket
CREATE POLICY "Anyone can view testimonial videos"
ON storage.objects FOR SELECT
USING (bucket_id = 'testimonial-videos');

CREATE POLICY "Admins can upload testimonial videos"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'testimonial-videos' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update testimonial videos"
ON storage.objects FOR UPDATE
USING (bucket_id = 'testimonial-videos' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete testimonial videos"
ON storage.objects FOR DELETE
USING (bucket_id = 'testimonial-videos' AND public.has_role(auth.uid(), 'admin'));