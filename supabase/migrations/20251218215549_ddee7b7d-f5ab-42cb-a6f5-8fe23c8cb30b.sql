-- Add social media and motto fields to founders table
ALTER TABLE public.founders
ADD COLUMN IF NOT EXISTS linkedin_url text,
ADD COLUMN IF NOT EXISTS instagram_url text,
ADD COLUMN IF NOT EXISTS twitter_url text,
ADD COLUMN IF NOT EXISTS motto text,
ADD COLUMN IF NOT EXISTS work text;