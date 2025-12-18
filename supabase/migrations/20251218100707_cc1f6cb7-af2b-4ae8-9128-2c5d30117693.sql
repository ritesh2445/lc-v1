
-- Add map_link field to events table
ALTER TABLE public.events ADD COLUMN map_link text;

-- Create services table
CREATE TABLE public.services (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  description text NOT NULL,
  banner_image_url text,
  whatsapp_message text,
  display_order integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on services
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;

-- Services RLS policies
CREATE POLICY "Anyone can view active services" ON public.services FOR SELECT USING (is_active = true);
CREATE POLICY "Admins can insert services" ON public.services FOR INSERT WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can update services" ON public.services FOR UPDATE USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can delete services" ON public.services FOR DELETE USING (has_role(auth.uid(), 'admin'::app_role));

-- Create banner_slides table
CREATE TABLE public.banner_slides (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  subtitle text NOT NULL,
  description text NOT NULL,
  image_url text,
  cta_text text NOT NULL DEFAULT 'Learn More',
  cta_link text NOT NULL DEFAULT '/services',
  icon_type text NOT NULL DEFAULT 'heart',
  display_order integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on banner_slides
ALTER TABLE public.banner_slides ENABLE ROW LEVEL SECURITY;

-- Banner slides RLS policies
CREATE POLICY "Anyone can view active banner slides" ON public.banner_slides FOR SELECT USING (is_active = true);
CREATE POLICY "Admins can insert banner slides" ON public.banner_slides FOR INSERT WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can update banner slides" ON public.banner_slides FOR UPDATE USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can delete banner slides" ON public.banner_slides FOR DELETE USING (has_role(auth.uid(), 'admin'::app_role));

-- Triggers for updated_at
CREATE TRIGGER update_services_updated_at BEFORE UPDATE ON public.services FOR EACH ROW EXECUTE FUNCTION public.update_timestamp();
CREATE TRIGGER update_banner_slides_updated_at BEFORE UPDATE ON public.banner_slides FOR EACH ROW EXECUTE FUNCTION public.update_timestamp();

-- Create storage bucket for service images
INSERT INTO storage.buckets (id, name, public) VALUES ('service-images', 'service-images', true);

-- Storage policies for service-images
CREATE POLICY "Service images are publicly accessible" ON storage.objects FOR SELECT USING (bucket_id = 'service-images');
CREATE POLICY "Admins can upload service images" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'service-images' AND has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can update service images" ON storage.objects FOR UPDATE USING (bucket_id = 'service-images' AND has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can delete service images" ON storage.objects FOR DELETE USING (bucket_id = 'service-images' AND has_role(auth.uid(), 'admin'::app_role));

-- Create storage bucket for banner images
INSERT INTO storage.buckets (id, name, public) VALUES ('banner-images', 'banner-images', true);

-- Storage policies for banner-images
CREATE POLICY "Banner images are publicly accessible" ON storage.objects FOR SELECT USING (bucket_id = 'banner-images');
CREATE POLICY "Admins can upload banner images" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'banner-images' AND has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can update banner images" ON storage.objects FOR UPDATE USING (bucket_id = 'banner-images' AND has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can delete banner images" ON storage.objects FOR DELETE USING (bucket_id = 'banner-images' AND has_role(auth.uid(), 'admin'::app_role));

-- Insert default banner slides
INSERT INTO public.banner_slides (title, subtitle, description, cta_text, cta_link, icon_type, display_order) VALUES
('Meet Our Founders', 'The Heart Behind ListeningClub', 'Discover the passionate individuals who created ListeningClub to make mental health support accessible to everyone.', 'Meet the Team', '/founders', 'users', 0),
('Upcoming Events', 'Join Our Community Sessions', 'Participate in workshops, support groups, and wellness sessions designed to nurture your mental wellbeing.', 'View Events', '/events', 'calendar', 1),
('Our Mission', 'A Space to Listen, Heal, and Grow', 'ListeningClub is dedicated to creating safe, judgment-free spaces where everyone can find support on their mental health journey.', 'Learn More', '/services', 'heart', 2);
