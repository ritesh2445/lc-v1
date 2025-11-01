-- Create FAQs table
CREATE TABLE public.faqs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.faqs ENABLE ROW LEVEL SECURITY;

-- Allow everyone to read active FAQs
CREATE POLICY "Anyone can view active FAQs"
ON public.faqs
FOR SELECT
USING (is_active = true);

-- Only admins can manage FAQs
CREATE POLICY "Admins can insert FAQs"
ON public.faqs
FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update FAQs"
ON public.faqs
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete FAQs"
ON public.faqs
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Create volunteers table
CREATE TABLE public.volunteers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  quote TEXT NOT NULL,
  image_url TEXT NOT NULL,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.volunteers ENABLE ROW LEVEL SECURITY;

-- Allow everyone to read active volunteers
CREATE POLICY "Anyone can view active volunteers"
ON public.volunteers
FOR SELECT
USING (is_active = true);

-- Only admins can manage volunteers
CREATE POLICY "Admins can insert volunteers"
ON public.volunteers
FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update volunteers"
ON public.volunteers
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete volunteers"
ON public.volunteers
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Create contact_info table
CREATE TABLE public.contact_info (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  instagram_url TEXT,
  linkedin_url TEXT,
  email TEXT,
  phone TEXT,
  address TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.contact_info ENABLE ROW LEVEL SECURITY;

-- Allow everyone to read contact info
CREATE POLICY "Anyone can view contact info"
ON public.contact_info
FOR SELECT
USING (true);

-- Only admins can manage contact info
CREATE POLICY "Admins can insert contact info"
ON public.contact_info
FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update contact info"
ON public.contact_info
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Add update triggers
CREATE TRIGGER update_faqs_timestamp
BEFORE UPDATE ON public.faqs
FOR EACH ROW EXECUTE FUNCTION public.update_timestamp();

CREATE TRIGGER update_volunteers_timestamp
BEFORE UPDATE ON public.volunteers
FOR EACH ROW EXECUTE FUNCTION public.update_timestamp();

CREATE TRIGGER update_contact_info_timestamp
BEFORE UPDATE ON public.contact_info
FOR EACH ROW EXECUTE FUNCTION public.update_timestamp();

-- Insert default contact info
INSERT INTO public.contact_info (instagram_url, linkedin_url, email, phone) 
VALUES (
  'https://instagram.com/innerglow',
  'https://linkedin.com/company/innerglow',
  'contact@innerglow.com',
  '+1234567890'
);