-- Add new columns to contact_submissions table
ALTER TABLE public.contact_submissions 
ADD COLUMN IF NOT EXISTS age integer,
ADD COLUMN IF NOT EXISTS profession text,
ADD COLUMN IF NOT EXISTS city text;

-- Remove email requirement (make it optional) and add message as optional too
-- First drop NOT NULL constraint on email and message since we're changing the form
ALTER TABLE public.contact_submissions 
ALTER COLUMN email DROP NOT NULL,
ALTER COLUMN message DROP NOT NULL;