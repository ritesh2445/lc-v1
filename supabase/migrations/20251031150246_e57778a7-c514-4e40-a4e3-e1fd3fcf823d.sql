-- Create settings table for storing app configuration
CREATE TABLE public.settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT UNIQUE NOT NULL,
  value TEXT NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

-- Allow everyone to read settings (public data)
CREATE POLICY "Anyone can read settings"
ON public.settings
FOR SELECT
USING (true);

-- Only allow authenticated users to update settings (we'll add admin check in the app)
CREATE POLICY "Authenticated users can update settings"
ON public.settings
FOR UPDATE
TO authenticated
USING (true);

-- Only allow authenticated users to insert settings
CREATE POLICY "Authenticated users can insert settings"
ON public.settings
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Insert default WhatsApp contact
INSERT INTO public.settings (key, value)
VALUES ('whatsapp_contact', '1234567890')
ON CONFLICT (key) DO NOTHING;

-- Create trigger for updating timestamp
CREATE OR REPLACE FUNCTION public.update_settings_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_settings_updated_at
BEFORE UPDATE ON public.settings
FOR EACH ROW
EXECUTE FUNCTION public.update_settings_timestamp();