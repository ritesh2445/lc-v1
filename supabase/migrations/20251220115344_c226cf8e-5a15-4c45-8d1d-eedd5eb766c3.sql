-- Fix settings table RLS policies to require admin role

-- Drop existing overly permissive policies
DROP POLICY IF EXISTS "Authenticated users can insert settings" ON public.settings;
DROP POLICY IF EXISTS "Authenticated users can update settings" ON public.settings;

-- Create new admin-only policies
CREATE POLICY "Admins can insert settings" ON public.settings
FOR INSERT TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "Admins can update settings" ON public.settings
FOR UPDATE TO authenticated
USING (public.has_role(auth.uid(), 'admin'::public.app_role));