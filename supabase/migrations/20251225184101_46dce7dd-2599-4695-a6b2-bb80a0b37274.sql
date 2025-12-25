-- Add phone column to contact_submissions table
ALTER TABLE public.contact_submissions ADD COLUMN IF NOT EXISTS phone text;

-- Add end_date column to events table for multi-day events
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS end_date date;